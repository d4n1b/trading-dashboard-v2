import { formatDate } from "date-fns";

export const __DEV__ = process.env.NODE_ENV === "development";

const USE_MOCK_API = process.env.NEXT_PUBLIC_MOCK_APIS === "true";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const API_CACHE_MS =
  Number(process.env.NEXT_PUBLIC_API_CACHE_DAYS || 1) * 1000 * 60 * 60 * 24; // defaults to 1 day

const LOCAL_TIMEZONE_CODE = formatDate(new Date(), "z");

export const config = {
  LOCAL_TIMEZONE_CODE,
  DATE_FORMAT_ISO_DATE: `yyyy-MM-dd`,
  DATE_FORMAT_ISO_DATE_SHORT: `yy-MM-dd`,
  DATE_FORMAT_ISO_DATETIME: `yyyy-MM-dd HH:mm '(${LOCAL_TIMEZONE_CODE})'`,
  login: {
    DEFAULT_USERNAME: process.env.NEXT_PUBLIC_LOGIN_FORM_DEFAULT_USERNAME || "",
    DEFAULT_PASSWORD: process.env.NEXT_PUBLIC_LOGIN_FORM_DEFAULT_PASSWORD || "",
  },
  EXCHANGE_RATE_API_URL: `https://v6.exchangerate-api.com/v6/${process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY}/latest/USD`,
  EARNINGS_CALENDAR_API_URL: `/assets/earnings_calendar.json`, // needs yearly refetch from scripts
  API_URL,
  API_CACHE_MS,
  trading: {
    DIVIDENDS_ENDPOINT_RATE_LIMIT_MS: 60000 / 6, // 6/1m
    TRANSACTIONS_ENDPOINT_RATE_LIMIT_MS: 60000 / 6, // 6/1m
    // Keeping the mock as the rate limit is too aggresive
    INSTRUMENTS_URL: "/assets/instruments.json",
    // INSTRUMENTS_URL: USE_MOCK_API
    //   ? "/assets/instruments.json"
    //   : `${API_URL}/trading/v0/equity/metadata/instruments`,
    POSITION_URL: USE_MOCK_API
      ? "/assets/positions.json"
      : `${API_URL}/trading/v0/equity/portfolio`,
    INSTRUMENT_DIVIDENDS_URL: USE_MOCK_API
      ? "/assets/history_dividends.json"
      : `${API_URL}/trading/v0/history/dividends`,
    INSTRUMENT_TRANSACTIONS_URL: USE_MOCK_API
      ? "/assets/history_orders.json"
      : `${API_URL}/trading/v0/equity/history/orders`,
    ACCOUNT_METADATA_URL: USE_MOCK_API
      ? "/assets/account_metadata.json"
      : `${API_URL}/trading/v0/equity/account/info`,
    ACCOUNT_BALANCE_URL: USE_MOCK_API
      ? "/assets/account_balance.json"
      : `${API_URL}/trading/v0/equity/account/cash`,
  },
  cacheKey: {
    SYNCED_AT: "SYNCED_AT",
    EXCHANGE_RATE: "EXCHANGE_RATE",
    EARNINGS_CALENDAR: "EARNINGS_CALENDAR",
    ACCOUNT_BALANCE: "ACCOUNT_BALANCE",
    ACCOUNT_METADATA: "ACCOUNT_METADATA",
    POSITIONS: "POSITIONS",
    INSTRUMENTS: "INSTRUMENTS",
    DIVIDENDS: "DIVIDENDS",
    TRANSACTIONS: "TRANSACTIONS",
    PRIVACY_MODE: "PRIVACY_MODE",
  },
};

export const contryMap = {
  CA: "Canada",
  US: "United States",
  IE: "Ireland",
  XS: "Euroclear/Clearstream", // Not a country, but used for international securities
  GB: "United Kingdom",
  KY: "Cayman Islands",
  LU: "Luxembourg",
  FR: "France",
  PT: "Portugal",
  DE: "Germany",
  CH: "Switzerland",
  NL: "Netherlands",
  ES: "Spain",
  JE: "Jersey",
  MU: "Mauritius",
  IL: "Israel",
  BE: "Belgium",
  AT: "Austria",
  IM: "Isle of Man",
  BM: "Bermuda",
  GG: "Guernsey",
  VG: "British Virgin Islands",
  AU: "Australia",
  MH: "Marshall Islands",
  BR: "Brazil",
  BS: "Bahamas",
  SG: "Singapore",
  PA: "Panama",
  CY: "Cyprus",
  ZM: "Zambia",
  PR: "Puerto Rico",
  AN: "Netherlands Antilles", // Note: Dissolved in 2010, but code might still be in use
  FI: "Finland",
  IT: "Italy",
  ZA: "South Africa",
  GI: "Gibraltar",
  JP: "Japan",
  LR: "Liberia",
  DK: "Denmark",
  NO: "Norway",
  NG: "Nigeria",
  SE: "Sweden",
  MX: "Mexico",
  VI: "U.S. Virgin Islands",
  GA: "Gabon",
  BG: "Bulgaria",
  AR: "Argentina",
  MC: "Monaco",
  CN: "China",
};

export const shortNameTickerMap: Record<string, string> = {
  AEDASe_EQ: "AEDAS.MC",
  AMZd_EQ: "AMZ.DE",
  ASMLa_EQ: "ASML.AS",
  BBOXl_EQ: "BBOX.L",
  IBS_PT_EQ: "IBS.LS",
  ICSUl_EQ: "ICSU.L",
  INRGl_EQ: "INRG.L",
  QDVEd_EQ: "QDVE.DE",
  RIO_US_EQ: "RIO.L",
  SGROl_EQ: "SGRO.L",
};

export const tickerGlobalFinvizMap: Record<string, string> = {
  "AEDAS.MC": "AEDAS",
  "AMZ.DE": "AMZN",
  "ASML.AS": "ASML",
  "RIO.L": "RIO",
};

export const instrumentCustomType = {
  Delisted: "delisted",
};
