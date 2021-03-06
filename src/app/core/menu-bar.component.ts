import { ChangeDetectionStrategy, Component, Injector, Input, OnInit } from '@angular/core';
import { LoginService } from 'app/core/login.service';
import { MenuDensity } from 'app/core/menu-density';
import { MenuService } from 'app/core/menu.service';
import { I18n } from 'app/i18n/i18n';
import { AbstractComponent } from 'app/shared/abstract.component';
import { Breakpoint, LayoutService } from 'app/shared/layout.service';
import { ActiveMenu, MenuType, RootMenuEntry } from 'app/shared/menu';
import { Observable } from 'rxjs';

const MenuThesholdLarge = 5;
const MenuThesholdExtraLarge = 6;

/**
 * A bar displayed on large layouts with the root menu items
 */
@Component({
  selector: 'menu-bar',
  templateUrl: 'menu-bar.component.html',
  styleUrls: ['menu-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuBarComponent extends AbstractComponent implements OnInit {

  // Export to the template
  MenuType = MenuType;

  roots$: Observable<RootMenuEntry[]>;

  constructor(
    injector: Injector,
    public layout: LayoutService,
    public login: LoginService,
    public i18n: I18n,
    private menu: MenuService) {
    super(injector);
  }

  @Input() activeMenu: ActiveMenu;

  ngOnInit() {
    super.ngOnInit();
    this.roots$ = this.menu.menu(MenuType.BAR);
  }

  density(roots: RootMenuEntry[], breakpoints: Set<Breakpoint>): MenuDensity {
    const threshold = breakpoints.has('xl') ? MenuThesholdExtraLarge : MenuThesholdLarge;
    return roots.length > threshold ? MenuDensity.Dense : MenuDensity.Medium;
  }

}
