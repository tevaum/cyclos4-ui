import { ChangeDetectionStrategy, Component, Injector, OnInit } from '@angular/core';
import {
  AccountType, Currency, PreselectedPeriod, RoleEnum,
  TransferDataForSearch, TransferFilter, TransferQueryFilters, TransferResult, TransOrderByEnum,
} from 'app/api/models';
import { TransfersService } from 'app/api/services';
import { BankingHelperService } from 'app/core/banking-helper.service';
import { ApiHelper } from 'app/shared/api-helper';
import { BaseSearchPageComponent } from 'app/shared/base-search-page.component';
import { empty } from 'app/shared/helper';
import { Menu } from 'app/shared/menu';
import { BehaviorSubject } from 'rxjs';

type TransferSearchParams = TransferQueryFilters & {
  fields?: Array<string>;
};

/**
 * General transfers search
 */
@Component({
  selector: 'search-transfers-overview',
  templateUrl: 'search-transfers-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchTransfersOverviewComponent
  extends BaseSearchPageComponent<TransferDataForSearch, TransferSearchParams, TransferResult>
  implements OnInit {

  filters$ = new BehaviorSubject<TransferFilter[]>([]);
  singleCurrency: Currency;
  singleAccount: AccountType;
  hasTransactionNumber: boolean;
  transactionNumberPattern: string;

  constructor(
    injector: Injector,
    private transfersService: TransfersService,
    public bankingHelper: BankingHelperService,
  ) {
    super(injector);
  }

  get preselectedPeriods(): PreselectedPeriod[] {
    return this.data == null ? null : this.data.preselectedPeriods;
  }

  get transferFilters(): TransferFilter[] {
    return this.data == null ? null : this.data.transferFilters;
  }

  getFormControlNames() {
    return [
      'preselectedPeriod',
      'periodBegin', 'periodEnd',
      'groups', 'channels',
      'fromAccountType', 'toAccountType',
      'transferFilters',
      'transferKinds', 'chargedBack',
      'minAmount', 'maxAmount',
      'transactionNumber',
      'user', 'by', 'orderBy',
    ];
  }

  getInitialFormValue(data: TransferDataForSearch) {
    const value = super.getInitialFormValue(data);
    // Only Cyclos 4.12.2 onwards sends a default order by
    value.orderBy = value.orderBy || TransOrderByEnum.DATE_DESC;
    return value;
  }

  ngOnInit() {
    super.ngOnInit();

    // Get the transfers overview data
    this.stateManager.cache('data',
      this.transfersService.getTransferDataForSearch(),
    ).subscribe(data => {
      this.data = data;
    });
  }

  onDataInitialized(data: TransferDataForSearch) {
    super.onDataInitialized(data);
    this.singleCurrency = (data.currencies || [])[0];
    this.singleAccount = (data.accountTypes || [])[0];
    const transactionNumberPatterns = (data.currencies || [])
      .map(c => c.transactionNumberPattern)
      .filter(p => p)
      .reduce((unique, item) => unique.includes(item) ? unique : [...unique, item], []);
    this.hasTransactionNumber = transactionNumberPatterns.length > 0;
    this.transactionNumberPattern = transactionNumberPatterns.length === 1 ? transactionNumberPatterns[0] : null;
    this.bankingHelper.preProcessPreselectedPeriods(data, this.form);
    this.addSub(this.form.controls.fromAccountType.valueChanges.subscribe(
      fromAt => this.updateFilters(data, fromAt)));

    this.updateFilters(data);

    this.headingActions = this.exportHelper.headingActions(data.exportFormats,
      f => this.transfersService.exportTransfers$Response({
        format: f.internalName,
        ...this.toSearchParams(this.form.value)
      }));
  }

  toSearchParams(value: any): TransferSearchParams {
    const query: TransferSearchParams = value;
    query.transferFilters = value.transferFilter == null ? [] : [value.transferFilter.id];
    query.datePeriod = this.bankingHelper.resolveDatePeriod(value);
    query.amountRange = ApiHelper.rangeFilter(value.minAmount, value.maxAmount);
    query.fields = [];
    return query;
  }

  doSearch(query: TransferSearchParams) {
    return this.transfersService.searchTransfers$Response(query);
  }

  /**
   * Returns the route components for the given row
   * @param row The row
   */
  path(row: TransferResult): string[] {
    return ['/banking', 'transfer', this.bankingHelper.transactionNumberOrId(row)];
  }

  get toLink() {
    return (row: TransferResult) => this.path(row);
  }

  private updateFilters(data: TransferDataForSearch, fromAccountType?: string) {
    let filters = (data.transferFilters || []);
    if (!empty(fromAccountType)) {
      filters = filters.filter(f => f.accountType.id === fromAccountType);
    }
    this.filters$.next(filters);
  }

  resolveMenu() {
    return this.dataForUiHolder.role === RoleEnum.ADMINISTRATOR
      ? Menu.ADMIN_TRANSFERS_OVERVIEW : Menu.BROKER_TRANSFERS_OVERVIEW;
  }

}
