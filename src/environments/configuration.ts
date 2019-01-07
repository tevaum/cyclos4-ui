import { AdCategoryConfiguration } from 'app/content/ac-category-configuration';
import { BannerCardsResolver } from 'app/content/banner-cards-resolver';
import { ContentGetter } from 'app/content/content-getter';
import { ContentPagesResolver } from 'app/content/content-pages-resolver';
import { ContentWithLayout } from 'app/content/content-with-layout';
import { DashboardResolver } from 'app/content/dashboard-resolver';
import { DefaultDashboardResolver } from 'environments/default-dashboard-resolver';

// This file defines the environment variables shared by both development and production

// The root URL for the API. Either 'api' (without slashes) when using a proxy, or the full URL
// (with protocol) to the Cyclos backend, ending with /api.
const API_URL = 'http://localhost:8888/api';

// Application title
const APP_TITLE = 'Cyclos Local';
// Application title on small devices (constrained space)
const APP_TITLE_SMALL = 'Cyclos';
// The application title displayed on the title bar inside the menu on small devices
const APP_TITLE_MENU = 'Cyclos menu';

// Available choices for number of results in a search. The default is the smallest one
const SEARCH_PAGE_SIZES = [40, 100, 200];
// Number of results displayed on quick searches, such as on user selection
const QUICK_SEARCH_PAGE_SIZE = 10;

// **** Advertisements category customization **** //
// Configuration by category internal name or id
const AD_CATEGORIES: { [internalName: string]: AdCategoryConfiguration } = {
  'community': { icon: 'people', color: '#2196f3' },
  'food': { icon: 'restaurant', color: '#f04d4e' },
  'goods': { icon: 'pages', color: '#ff9700' },
  'housing': { icon: 'location_city', color: '#029487' },
  'jobs': { icon: 'work', color: '#8062b3' },
  'labor': { icon: 'business', color: '#de3eaa' },
  'leisure': { icon: 'mood', color: '#687ebd' },
  'services': { icon: 'room_service', color: '#8ec63f' }
};

// **** Content **** //
// See the project home page for help on how to customize content

// A static application translation file
// May be left to null to resolve dynamically according to the Cyclos configuration,
// or set here to prevent an additional request to load the translation values
import translationValues from 'locale/cyclos4-ui.json';
const TRANSLATION: any = translationValues;

// The home page shown for guests
const HOME_PAGE: ContentWithLayout = {

  // To enable local cache, set a cache key and a number of seconds
  // cacheKey: 'home',
  // cacheSeconds: 360, // 360 seconds = 1 hour

  // By default, the page is shown using the full width. You can set it to card, instead
  // layout: 'card',

  // When setting a title it will be on layout card by default
  // title: 'Welcome',

  // The content can be obtained by fetching a URL, or by a Cyclos floating content page
  // See the documentation on ContentGetter for more details.
  content: ContentGetter.url('content/home.html')
};

// Dashboard resolver
const DASHBOARD_RESOLVER = new DefaultDashboardResolver();

// Content pages resolver
const CONTENT_PAGES_RESOLVER = null;

// Banner cards resolver
const BANNER_CARDS_RESOLVER = null;


////////////////////////////////////////////////////////////
// **** Final configuration. Please, don't modify it **** //
////////////////////////////////////////////////////////////
export const configuration = {
  production: true,
  appTitle: APP_TITLE,
  appTitleSmall: APP_TITLE_SMALL,
  appTitleMenu: APP_TITLE_MENU,
  apiRoot: API_URL,
  searchPageSizes: SEARCH_PAGE_SIZES,
  quickSearchPageSize: QUICK_SEARCH_PAGE_SIZE,
  adCategories: AD_CATEGORIES as { [internalName: string]: AdCategoryConfiguration },
  translationValues: TRANSLATION as any,
  homePage: HOME_PAGE as ContentWithLayout,
  dashboardResolver: DASHBOARD_RESOLVER as DashboardResolver,
  contentPagesResolver: CONTENT_PAGES_RESOLVER as ContentPagesResolver,
  bannerCardsResolver: BANNER_CARDS_RESOLVER as BannerCardsResolver
};
