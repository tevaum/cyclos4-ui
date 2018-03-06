import { Component, ChangeDetectionStrategy, Injector, Input } from '@angular/core';
import { BaseUsersComponent } from 'app/users/base-users.component';
import { AddressView, Country } from 'app/api/models';

/**
 * Component used to show the details of an address
 */
@Component({
  selector: 'view-address-details',
  templateUrl: 'view-address-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewAddressDetailsComponent extends BaseUsersComponent {
  constructor(injector: Injector) {
    super(injector);
  }

  @Input() address: AddressView;
  @Input() countries: Country[];

  get country(): string {
    let country: Country;
    if (this.address.country) {
      country = this.countries.find(c => c.code === this.address.country);
    }
    return country == null ? this.address.country : country.name;
  }
}
