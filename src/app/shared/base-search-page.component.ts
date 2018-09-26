import { OnInit, Injector } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { PagedResults } from 'app/shared/paged-results';
import { ApiHelper } from 'app/shared/api-helper';
import { ResultType } from 'app/shared/result-type';
import { HttpResponse } from '@angular/common/http';
import { debounceTime } from 'rxjs/operators';
import { PageData } from 'app/shared/page-data';
import { BasePageComponent } from 'app/shared/base-page.component';
import { isEqual } from 'lodash';
import { scrollTop } from 'app/shared/helper';
import { Action } from 'app/shared/action';

/**
 * Base class implemented by search pages.
 * @param D The data type
 * @param R The result type
 */
export abstract class BaseSearchPageComponent<D, R> extends BasePageComponent<D> implements OnInit {

  results$ = new BehaviorSubject<PagedResults<R>>(null);
  resultType$ = new BehaviorSubject<ResultType>(null);
  headingActions$ = new BehaviorSubject<Action[]>(null);
  loaded$ = new BehaviorSubject(false);
  rendering$ = new BehaviorSubject(false);
  moreFilters$ = new BehaviorSubject(false);
  previousResultType: ResultType;

  readonly form: FormGroup;
  previousValue: any;

  protected onDataInitialized(data: D) {
    this.stateManager.manage(this.form);
    this.previousValue = this.form.value;
    this.addSub(this.form.valueChanges.pipe(debounceTime(ApiHelper.DEBOUNCE_TIME)).subscribe(value => {
      if (this.shouldUpdateOnChange(value, this.previousValue)) {
        this.update();
      }
      this.previousValue = value;
    }), true);
    this.loaded = true;
  }

  protected onAfterSetData(data: D) {
    // When starting with categories, don't initially search
    if (this.getInitialResultType() !== ResultType.CATEGORIES) {
      this.update();
    }
  }

  /**
   * By default will just skip the update if only the result type has changed
   * @param value The current form value
   * @param previousValue The previous form value
   */
  protected shouldUpdateOnChange(value: any, previousValue: any): boolean {
    if (value.resultType === ResultType.CATEGORIES) {
      // Switching to the categories result type shouldn't perform a results search
      return false;
    }
    if (previousValue == null || previousValue.resultType === ResultType.CATEGORIES) {
      // Either first time or switching from categories. Update.
      return true;
    }
    const previousResultType = previousValue.resultType;
    const resultType = previousValue.resultType;
    try {
      delete previousValue.resultType;
      delete value.resultType;
      return !isEqual(previousValue, value);
    } finally {
      previousValue.resultType = previousResultType;
      value.resultType = resultType;
    }
  }

  get results(): PagedResults<R> {
    return this.results$.value;
  }
  set results(results: PagedResults<R>) {
    this.results$.next(results);
  }

  get rendering(): boolean {
    return this.rendering$.value;
  }
  set rendering(rendering: boolean) {
    this.rendering$.next(rendering);
  }

  get loaded(): boolean {
    return this.loaded$.value;
  }
  set loaded(loaded: boolean) {
    this.loaded$.next(loaded);
  }

  get moreFilters(): boolean {
    return this.moreFilters$.value;
  }
  set moreFilters(moreFilters: boolean) {
    this.moreFilters$.next(moreFilters);
  }

  get headingActions(): Action[] {
    return this.headingActions$.value;
  }
  set headingActions(headingActions: Action[]) {
    this.headingActions$.next(headingActions);
  }

  get pageData(): PageData {
    const val = this.form.value;
    return {
      page: val.page,
      pageSize: val.pageSize
    };
  }
  set pageData(pageData: PageData) {
    this.form.patchValue(pageData);
  }

  /**
   * May be overridden to define that the page has more filters
   */
  protected hasMoreFilters(): boolean {
    return false;
  }

  /**
   * Returns the result type control
   */
  get resultTypeControl(): FormControl {
    return this.form.get('resultType') as FormControl;
  }
  get resultType(): ResultType {
    return this.resultType$.value;
  }
  set resultType(resultType: ResultType) {
    if (resultType == null) {
      resultType = this.getInitialResultType();
    }
    const previous = this.resultType;
    if (previous == null || previous !== resultType) {
      this.rendering = true;
      this.resultType$.next(resultType);
      this.resultTypeControl.setValue(resultType, { emitEvent: false });
      this.onResultTypeChanged(resultType, previous);
    }
  }

  constructor(injector: Injector) {
    super(injector);
    const controls: any = {};
    controls.page = 0;
    controls.pageSize = null;
    controls.resultType = this.getInitialResultType();
    for (const name of this.getFormControlNames() || []) {
      controls[name] = null;
    }
    this.form = this.formBuilder.group(controls);
    this.addSub(this.resultTypeControl.valueChanges.subscribe(resultType => {
      this.resultType = resultType;
    }), false);
  }

  ngOnInit() {
    super.ngOnInit();
    this.resultType = this.getInitialResultType();
    if (this.hasMoreFilters) {
      this.headingActions = [
        new Action('filter_list', this.i18n('More filters'), () => this.moreFilters = !this.moreFilters)
      ];
    }
  }

  /**
   * Callback invoked whenever the result type changes
   * @param resultType The new result type
   * @param previous The previous result type
   */
  protected onResultTypeChanged(resultType: ResultType, previous: ResultType): void {
  }

  /**
   * Must be implemented to return the names for each form control
   */
  protected abstract getFormControlNames(): string[];

  /**
   * Can be overridden to determine the initial result type in this search
   */
  protected getInitialResultType(): ResultType {
    return ResultType.LIST;
  }

  /**
   * Must be implemented to actually call the API method for search
   */
  protected abstract doSearch(value: any): Observable<HttpResponse<R[]>>;

  /**
   * Updates the search results
   */
  protected update(pageData?: PageData) {
    if (pageData) {
      // Scroll to the beginning of the results before updating
      const results = document.getElementsByTagName('results-layout');
      const element = results.length === 0 ? null : results.item(0) as HTMLElement;
      scrollTop(element);
      this.form.patchValue(pageData, { emitEvent: false });
    }
    this.rendering = true;
    this.results = null;
    this.addSub(this.doSearch(this.form.value).subscribe(response => {
      this.results = PagedResults.from(response);
    }));
  }

  /**
   * Resets the current page and page size of the current form, optionally emitting the change event (which will trigger a new search)
   */
  resetPage(emitEvent = false) {
    this.form.patchValue({ page: 0, pageSize: null }, { emitEvent: emitEvent });
  }

}
