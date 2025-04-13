import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { format as formatDate } from "date-fns";
import {
  ChartBarIcon,
  MagnifyingGlassIcon,
  ExclamationCircleIcon,
  ClockIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";

import {
  Account,
  Instrument,
  InstrumentSortableKeys,
  LoginFormState,
  SortBy,
} from "../types";
import {
  AccountBalanceSkeleton,
  Container,
  Dropdown,
  DropdownOption,
  PrivacyButton,
  Image,
  Navbar,
  PortfolioSkeleton,
  SortByIcon,
  Spinner,
  Tooltip,
  NavbarProps,
} from "./ui";
import { filterLocaleBy, getAccountSyncedAt, getNextSortBy } from "../utils";
import {
  ACCOUNTS_FETCH,
  SELECTED_ACCOUNT_FETCH,
  SELECTED_ACCOUNT_REFETCH_ALL,
  ACCOUNTS_SELECTED_ACCOUNT_SET,
  LOGIN_FETCH,
  LOGOUT,
  SELECTED_ACCOUNT_REFETCH_POSITIONS,
  SELECTED_ACCOUNT_REFETCH_DIVIDENDS,
  ACCOUNTS_EXPORT_TO_CSV,
  SELECTED_ACCOUNT_BALANCE_REFETCH,
} from "../store/slices";
import {
  accountBalanceStateSelector,
  accountPositionsStateSelector,
  accountsStateSelector,
  authStateSelector,
  earningsReportStateSelector,
} from "../store/selectors";
import { instrumentCustomType, config } from "../config";

export function Login() {
  const dispatch = useDispatch();
  const authState = useSelector(authStateSelector);

  const [formData, setFormData] = React.useState<LoginFormState>({
    username: config.login.DEFAULT_USERNAME,
    password: config.login.DEFAULT_PASSWORD,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    dispatch(
      LOGIN_FETCH({
        username: formData.username,
        password: formData.password,
      })
    );
  };

  return (
    <Container>
      <div className="flex min-h-full flex-1 flex-col justify-center px-3 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Username
              </label>
              <div className="mt-2">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData((state) => ({
                      ...state,
                      [e.target.name]: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Password
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((state) => ({
                      ...state,
                      [e.target.name]: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={authState.loading}
                className={clsx(
                  "relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50",
                  {
                    "disabled:cursor-not-allowed": authState.isLoggedIn,
                  }
                )}
              >
                {authState.loading && <Spinner />} <span>Sign in</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Container>
  );
}

type CountryOption = DropdownOption & { value: string | null };
type TypeOption = DropdownOption & { value: string | null };

export function Dashboard() {
  const dispatch = useDispatch();

  const [privacyMode, setPrivacyMode] = React.useState(
    window.localStorage.getItem(config.cacheKey.PRIVACY_MODE) === "true"
  );
  const accountsState = useSelector(accountsStateSelector);
  const accountBalanceState = useSelector(accountBalanceStateSelector);
  const accountPositionsState = useSelector(accountPositionsStateSelector);
  const earningsReport = useSelector(earningsReportStateSelector);

  const handlePrivacyMode = () => {
    const value = !privacyMode;
    window.localStorage.setItem(config.cacheKey.PRIVACY_MODE, value.toString());
    setPrivacyMode(value);
  };

  const selectedAccount = accountsState.selectedAccount;
  const token = selectedAccount?.token;
  const prefix = selectedAccount?.key!;
  const syncedAt = getAccountSyncedAt(prefix);

  const accountPositions = accountPositionsState.accountPositions;

  const [sortBy, setSortBy] = React.useState<SortBy>(null);
  const [orderBy, setOrderBy] = React.useState<InstrumentSortableKeys | null>(
    null
  );
  const [query, setQuery] = React.useState<string>("");
  const [instrumentCountry, setInstrumentCountry] =
    React.useState<CountryOption | null>(null);
  const [instrumentType, setInstrumentType] =
    React.useState<CountryOption | null>(null);

  React.useEffect(() => {
    dispatch(ACCOUNTS_FETCH());
  }, [dispatch]);

  React.useEffect(() => {
    if (!token) return;

    dispatch(SELECTED_ACCOUNT_FETCH({ token }));
  }, [dispatch, token]);

  const instruments = React.useMemo(() => {
    let instruments = [...accountPositions];

    // Order by
    if (orderBy != null) {
      instruments = instruments.sort((a, b) => {
        const aValue = a[orderBy];
        const bValue = b[orderBy];

        if (typeof aValue === "number" && typeof bValue === "number") {
          if (aValue > bValue) return 1;
          if (aValue < bValue) return -1;
          return 0;
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          return aValue.localeCompare(bValue);
        }

        return 0;
      });
    }

    // Sort by
    if (sortBy === "desc") {
      instruments.reverse();
    }

    // Filter by
    if (query) {
      instruments = filterLocaleBy<Instrument>(instruments, query, [
        "fullName",
        "shortName",
      ]);
    }
    if (instrumentCountry?.value) {
      instruments = filterLocaleBy<Instrument>(
        instruments,
        instrumentCountry.value,
        ["countryOfOrigin"]
      );
    }
    if (instrumentType?.value) {
      instruments = filterLocaleBy<Instrument>(
        instruments,
        instrumentType.value,
        ["type"]
      );
    }

    return instruments;
  }, [
    accountPositions,
    orderBy,
    query,
    instrumentCountry,
    instrumentType,
    sortBy,
  ]);

  // Country options
  const countriesOptions = React.useMemo(() => {
    const options: CountryOption[] = Object.keys(
      [...accountPositions].reduce(
        (countries, instrument) => ({
          ...countries,
          [instrument.countryOfOrigin]: instrument.countryOfOrigin,
        }),
        {}
      )
    ).map((country) => ({ name: country, value: country }));
    options.unshift({ name: "All", value: null });

    return options;
  }, [accountPositions]);

  // Types options
  const typeOptions = React.useMemo(() => {
    const options: TypeOption[] = Object.keys(
      [...accountPositions].reduce(
        (types, instrument) => ({
          ...types,
          [instrument.type]: instrument.type,
        }),
        {}
      )
    ).map((type) => ({ name: type, value: type }));
    options.unshift({ name: "All", value: null });

    return options;
  }, [accountPositions]);

  const toggleOrderBy = (newOrderBy: InstrumentSortableKeys) => {
    const nextSortBy = getNextSortBy(sortBy);

    setSortBy(nextSortBy);
    setOrderBy(() => (nextSortBy == null ? null : newOrderBy));
  };

  const changeAccount = (account: Account) => {
    setSortBy(null);
    setOrderBy(null);
    setQuery("");
    setInstrumentCountry(null);
    setInstrumentType(null);
    dispatch(ACCOUNTS_SELECTED_ACCOUNT_SET(account));
  };

  const userNavigation: NavbarProps["userNavigation"] = React.useMemo(
    () => [
      {
        name: "Refresh account balance",
        href: "#",
        onClick: () =>
          dispatch(SELECTED_ACCOUNT_BALANCE_REFETCH({ token: token! })),
      },
      {
        name: "Refresh positions",
        href: "#",
        onClick: () =>
          dispatch(SELECTED_ACCOUNT_REFETCH_POSITIONS({ token: token! })),
      },
      {
        name: "Refresh dividends",
        href: "#",
        onClick: () =>
          dispatch(SELECTED_ACCOUNT_REFETCH_DIVIDENDS({ token: token! })),
      },
      "DIVIDER",
      {
        name: "Refresh all",
        href: "#",
        onClick: () =>
          dispatch(SELECTED_ACCOUNT_REFETCH_ALL({ token: token! })),
      },
      "DIVIDER",
      {
        name: "Export to CSV",
        href: "#",
        disabled: !accountsState.exportReady,
        onClick: () => dispatch(ACCOUNTS_EXPORT_TO_CSV()),
      },
      "DIVIDER",
      { name: "Sign out", href: "#", onClick: () => dispatch(LOGOUT()) },
    ],
    [accountsState.exportReady, dispatch, token]
  );

  const applyPrivacyMode = (value: string) => (privacyMode ? "****" : value);

  const renderRow = React.useCallback((instrument: Instrument) => {
    return (
      <tr key={instrument.ticker} className="border-b">
        <th
          scope="row"
          className="row-company flex items-center px-3 py-4 whitespace-nowrap"
        >
          <div className="flex min-w-0 gap-x-4">
            <Image
              className="company-logo h-12 w-12 flex-none rounded-full bg-gray-50"
              src={instrument.image}
              alt={instrument.ticker}
            />
            <div className="min-w-0 flex-auto">
              <div
                className="flex text-md font-bold text-gray-900"
                title={instrument.fullName}
              >
                <span className="company-name text-ellipsis truncate overflow-hidden max-w-64">
                  {instrument.fullName}
                </span>
                {!instrument.transactionItems ? (
                  <span className="inline-block ml-1">
                    <ClockIcon
                      title="Loading..."
                      className="h-5 w-5 text-gray-400 cursor-wait"
                      aria-hidden="true"
                    />
                  </span>
                ) : (
                  <Tooltip
                    className="ml-1"
                    trigger={
                      <span className="inline-block">
                        <ClockIcon
                          title="Click to see transactions"
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </span>
                    }
                  >
                    {instrument.transactionItems.length === 0 ? (
                      <div className="p-3 text-sm">
                        <p className="text-center">No data available</p>
                      </div>
                    ) : (
                      <div className="p-3 text-sm">
                        <p className="text-center">History</p>
                        <p className="text-center text-xs text-gray-500">
                          Prices are estimated
                        </p>
                        <table className="table-auto">
                          <thead>
                            <tr>
                              <th scope="col" className="px-3 py-3">
                                Date
                              </th>
                              <th scope="col" className="px-3 py-3">
                                Status
                              </th>
                              <th scope="col" className="px-3 py-3">
                                From Pie
                              </th>
                              <th scope="col" className="px-3 py-3">
                                Quantity
                              </th>
                              <th scope="col" className="px-3 py-3 hidden">
                                Limit Price
                              </th>
                              <th scope="col" className="px-3 py-3 hidden">
                                Stop Price
                              </th>
                              <th scope="col" className="px-3 py-3">
                                Share Price
                              </th>
                              <th scope="col" className="px-3 py-3">
                                Total
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {instrument.transactionItems?.map(
                              (transaction, transactionIndex) => (
                                <tr key={transactionIndex} className="border-b">
                                  <td className="px-3 py-4 whitespace-nowrap">
                                    {transaction.dateCreatedDisplay}
                                  </td>
                                  <td className="px-3 py-4 whitespace-nowrap capitalize">
                                    {transaction.statusDisplay}
                                  </td>
                                  <td className="px-3 py-4 text-number">
                                    {transaction.isPieDisplay}
                                  </td>
                                  <td className="px-3 py-4 text-number">
                                    {transaction.quantityDisplay}
                                  </td>
                                  <td className="px-3 py-4 text-number hidden">
                                    {transaction.limitPriceDisplay}
                                  </td>
                                  <td className="px-3 py-4 text-number hidden">
                                    {transaction.stopPriceDisplay}
                                  </td>
                                  <td className="px-3 py-4 text-number">
                                    {transaction.estimatedSharePriceDisplay}
                                  </td>
                                  <td className="px-3 py-4 text-number">
                                    {transaction.estimatedTotalDisplay}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </Tooltip>
                )}
                <Tooltip
                  className="ml-1"
                  trigger={
                    <span className="inline-block">
                      <CalendarDaysIcon
                        title="Click to see earning report dates"
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </span>
                  }
                >
                  {!instrument.earningsReports ? (
                    <div className="p-3 text-sm">
                      <p className="text-center">No data available</p>
                    </div>
                  ) : (
                    <div className="p-3 text-sm">
                      <p className="text-center">Earning report dates</p>
                      <table className="table-auto">
                        <thead className="hidden">
                          <tr>
                            <th scope="col" className="px-3 py-3">
                              Date
                            </th>
                            <th scope="col" className="px-3 py-3">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {instrument.earningsReports?.map(
                            (report, reportIndex) => (
                              <tr key={reportIndex} className="border-b">
                                <td className="px-3 py-4 whitespace-nowrap">
                                  {report.date}
                                </td>
                                <td
                                  className={clsx(
                                    "px-3 py-4 whitespace-nowrap capitalize",
                                    {
                                      "text-gray-500":
                                        report.datePeriod === "PAST",
                                      "text-red-400 font-bold":
                                        report.datePeriod === "TODAY",
                                      "text-yellow-500 font-bold":
                                        report.datePeriod === "TOMORROW",
                                      "text-green-500 font-bold":
                                        report.datePeriod === "FUTURE",
                                    }
                                  )}
                                >
                                  {report.datePeriod}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Tooltip>
              </div>
              <div className="mt-1 truncate text-xs">
                <ul className="list-disc list-inline uppercase">
                  {instrument.shortName && (
                    <li>
                      <span>{instrument.shortName}</span>
                    </li>
                  )}
                  {instrument.type && (
                    <li>
                      <span
                        className={clsx({
                          "text-red-500":
                            instrument.type === instrumentCustomType.Delisted,
                        })}
                      >
                        {instrument.type}
                      </span>
                    </li>
                  )}
                  {instrument.countryOfOrigin && (
                    <li>
                      <span>{instrument.countryOfOrigin}</span>
                    </li>
                  )}
                </ul>
              </div>
              <div className="mt-1 truncate text-xs">
                <ul className="list-disc list-inline">
                  {instrument.finvizLink && (
                    <li>
                      <a
                        target="_blank"
                        rel="noreferrer"
                        href={instrument.finvizLink}
                        className="text-link"
                      >
                        finviz
                      </a>
                    </li>
                  )}
                  {instrument.yahooLink && (
                    <li>
                      <a
                        target="_blank"
                        rel="noreferrer"
                        href={instrument.yahooLink}
                        className="text-link"
                      >
                        yahoo
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </th>
        <td className="px-3 py-4 text-number">
          {instrument.averagePriceDisplay} / {instrument.currentPriceDisplay}
        </td>
        <td className="px-3 py-4 text-number">{instrument.quantityDisplay}</td>
        <td className="px-3 py-4 text-number">
          {instrument.totalInvestedDisplay}
        </td>
        <td className="px-3 py-4 text-number">
          {instrument.totalInvestedPercentageDisplay}
        </td>
        <td
          className={clsx("px-3 py-4 text-number", {
            "text-green-500": instrument.ppl > 0,
            "text-red-500": instrument.ppl < 0,
          })}
        >
          {instrument.pplDisplay}
        </td>
        <td
          className={clsx("px-3 py-4 text-number", {
            "text-green-500": instrument.ppl > 0,
            "text-red-500": instrument.ppl < 0,
          })}
        >
          {instrument.pplPercentageDisplay}
        </td>
        <td
          className={clsx("px-3 py-4 text-number", {
            "text-green-500":
              typeof instrument?.dividendTotal !== "undefined" &&
              instrument.dividendTotal > 0,
          })}
        >
          {instrument?.dividendTotalDisplay || "Loading..."}
        </td>
        <td
          className={clsx(
            "px-3 py-4 text-number font-medium",
            typeof instrument?.pplAndDividends !== "undefined" && {
              "text-green-500": instrument.pplAndDividends > 0,
              "text-red-500": instrument.pplAndDividends < 0,
            }
          )}
        >
          {instrument?.pplAndDividendsDisplay || "Loading..."}
        </td>
      </tr>
    );
  }, []);

  return (
    <>
      <Navbar userNavigation={userNavigation} />
      <header className="bg-white shadow">
        <Container>
          <div className="flex justify-between gap-x-6">
            <div className="relative rounded-md tracking-tight">
              {accountBalanceState.error && (
                <p className="flex items-center text-sm text-red-600 mb-3">
                  <ExclamationCircleIcon
                    className="h-5 w-5 mr-1"
                    aria-hidden="true"
                  />
                  Could not load balance. Please refresh page.
                </p>
              )}

              {accountBalanceState.loading && <AccountBalanceSkeleton />}

              {!accountBalanceState.loading &&
                !accountBalanceState.error &&
                accountBalanceState.accountBalance && (
                  <>
                    <p className="text-2xl font-medium text-gray-900">
                      <PrivacyButton
                        className="mr-2"
                        onClick={handlePrivacyMode}
                        active={privacyMode}
                      />
                      {applyPrivacyMode(
                        accountBalanceState.accountBalance.totalDisplay
                      )}
                    </p>
                    <div className="flex flex-wrap gap-x-6 mt-1">
                      <div>
                        <div className="text-xs sm:text-sm">Invested</div>
                        <div className="text-sm md:text-md font-medium text-gray-900">
                          {applyPrivacyMode(
                            accountBalanceState.accountBalance.investedDisplay
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm">Return</div>
                        <div
                          className={clsx(
                            "text-sm md:text-md font-medium text-gray-900",
                            {
                              "text-green-500":
                                accountBalanceState.accountBalance.ppl > 0,
                              "text-red-500":
                                accountBalanceState.accountBalance.ppl < 0,
                            }
                          )}
                        >
                          {applyPrivacyMode(
                            accountBalanceState.accountBalance.pplDisplay
                          )}{" "}
                          (
                          {applyPrivacyMode(
                            accountBalanceState.accountBalance
                              .pplPercentageDisplay
                          )}
                          )
                        </div>
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm">Free funds</div>
                        <div className="text-sm sm:text-md font-medium text-green-500">
                          {applyPrivacyMode(
                            accountBalanceState.accountBalance.freeFundsDisplay
                          )}
                        </div>
                      </div>
                    </div>
                    {syncedAt && (
                      <p className="flex text-xs font-normal text-gray-400 mt-1">
                        <ClockIcon className="h-4 w-4 mr-1" /> Synced at{" "}
                        {formatDate(new Date(syncedAt), "PPp")}
                      </p>
                    )}
                  </>
                )}
            </div>
            <div className="w-30 sm:w-40">
              <Dropdown<Account>
                label="Account"
                placeholder="Select account"
                value={selectedAccount}
                onChange={changeAccount}
                options={accountsState.accounts}
              />
            </div>
          </div>
        </Container>
      </header>
      <Container>
        {accountPositionsState.error && (
          <p className="flex items-center text-sm text-red-600 mb-3">
            <ExclamationCircleIcon
              className="h-5 w-5 mr-1"
              aria-hidden="true"
            />
            Could not load portfolio. Please refresh page.
          </p>
        )}

        <div className="relative">
          {accountPositionsState.loading && <PortfolioSkeleton />}

          {!accountPositionsState.loading && !accountPositionsState.error && (
            <div>
              <div className="sm:flex gap-x-4 mb-5">
                <div className="flex-1 min-w-0">
                  <p className="block text-sm font-medium leading-6 text-gray-900">
                    Next earnings reports
                  </p>
                  {earningsReport.loading ? (
                    <div className="p-2 rounded-md border border-indigo-200 text-sm text-indigo-500 bg-indigo-100">
                      <p className="text-center">Loading...</p>
                    </div>
                  ) : (
                    <>
                      {!earningsReport.report?.nextWeeksEarnings ||
                      !earningsReport.report.nextWeeksEarnings.length ? (
                        <div className="p-2 rounded-md border border-indigo-200 text-sm text-indigo-500 bg-indigo-100">
                          <p className="text-center">No data available</p>
                        </div>
                      ) : (
                        <div className="rounded-md border border-indigo-100 overflow-auto max-w-full">
                          <table className="w-full text-xs text-left rtl:text-right">
                            <thead>
                              <tr className="bg-indigo-300 text-white">
                                {earningsReport.report.nextWeeksEarnings.map(
                                  (report, reportIndex) => (
                                    <td
                                      key={reportIndex}
                                      className={clsx(
                                        "px-3 py-0.5 capitalize whitespace-nowrap",
                                        {
                                          "font-bold text-indigo-800 bg-yellow-200":
                                            report.dateShort === "TOMORROW",
                                          "font-bold text-indigo-800 bg-red-200":
                                            report.dateShort === "TODAY",
                                        }
                                      )}
                                    >
                                      {report.dateShort}
                                    </td>
                                  )
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="text-indigo-500 bg-indigo-100">
                                {earningsReport.report.nextWeeksEarnings.map(
                                  (report, reportIndex) => (
                                    <td
                                      key={reportIndex}
                                      className={clsx(
                                        "px-3 py-0.5 capitalize whitespace-nowrap",
                                        {
                                          "font-bold bg-red-50":
                                            report.dateShort === "TODAY",
                                          "font-bold bg-yellow-50":
                                            report.dateShort === "TOMORROW",
                                        }
                                      )}
                                    >
                                      {report.stocksDisplay}
                                    </td>
                                  )
                                )}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="flex-none">
                  <p className="block text-sm font-medium leading-6 text-gray-900">
                    &#8203;
                  </p>
                  {!accountsState.allDividendsReady ? (
                    <button
                      title="Loading..."
                      type="button"
                      className="flex justify-center items-center cursor-wait text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5"
                      disabled
                    >
                      <ChartBarIcon className="h-4 w-4 mr-1" />
                      Show Dividends
                    </button>
                  ) : (
                    <Tooltip
                      trigger={
                        <span className="inline-block">
                          <button
                            type="button"
                            className="flex justify-center items-center text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5"
                          >
                            <ChartBarIcon className="h-4 w-4 mr-1" />
                            Show Dividends
                          </button>
                        </span>
                      }
                    >
                      {accountsState.allDividends.length === 0 ? (
                        <div className="p-3 text-sm">
                          <p className="text-center">No data available</p>
                        </div>
                      ) : (
                        <div className="p-3 text-sm">
                          <p className="text-center">Dividends Paid</p>
                          <p className="text-center text-xs text-gray-500">
                            Prices are estimated
                          </p>
                          <table className="table-auto">
                            <thead>
                              <tr>
                                <th scope="col" className="px-3 py-3">
                                  Company
                                </th>
                                <th scope="col" className="px-3 py-3">
                                  Date
                                </th>
                                <th scope="col" className="px-3 py-3">
                                  Total
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {accountsState.allDividends?.map(
                                (dividend, dividendIndex) => (
                                  <tr key={dividendIndex} className="border-b">
                                    <td className="px-3 py-1 flex items-center whitespace-nowrap capitalize text-center font-medium">
                                      <Image
                                        className="mr-2 block company-logo h-8 w-8 rounded-full bg-gray-50"
                                        src={dividend.companyImage}
                                        alt={dividend.ticker}
                                      />
                                      <p className="text-xs">
                                        {dividend.companyName}
                                      </p>
                                    </td>
                                    <td className="px-3 py-1 whitespace-nowrap">
                                      {dividend.paidOnDisplay}
                                    </td>
                                    <td className="px-3 py-1 text-number">
                                      {dividend.amountDisplay}
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </Tooltip>
                  )}
                </div>
              </div>

              <div className="filters grid grid-cols-1 md:grid-cols-2 pb-4">
                <div className="sm:w-full">
                  <label
                    htmlFor="table-search"
                    className="block text-xs font-medium leading-6 text-gray-900"
                  >
                    Search
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
                      <MagnifyingGlassIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </div>
                    <input
                      type="text"
                      className="block w-full md:w-80 p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-md bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Search companies"
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-x-4">
                  <div className="w-full">
                    <Dropdown<CountryOption>
                      label="Filter by country"
                      placeholder="Select country"
                      value={instrumentCountry}
                      onChange={setInstrumentCountry}
                      options={countriesOptions}
                    />
                  </div>
                  <div className="w-full">
                    <Dropdown<TypeOption>
                      label="Filter by type"
                      placeholder="Select type"
                      value={instrumentType}
                      onChange={setInstrumentType}
                      options={typeOptions}
                    />
                  </div>
                </div>
              </div>

              <div className="pb-2">
                <div className="text-xs sm:text-sm">
                  Showing{" "}
                  <span className="font-medium">{instruments.length}</span> of{" "}
                  <span className="font-medium">{accountPositions.length}</span>{" "}
                  companies
                </div>
              </div>

              <div className="rounded-md border border-gray-300 overflow-auto">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 z-0 whitespace-nowrap">
                    <tr>
                      <th scope="col" className="px-3 py-3">
                        <span
                          title="Company"
                          className="flex cursor-pointer"
                          onClick={() => toggleOrderBy("fullName")}
                        >
                          Company
                          <SortByIcon
                            active={orderBy === "fullName"}
                            sortBy={sortBy}
                          />
                        </span>
                      </th>
                      <th scope="col" className="px-3 py-3">
                        <span
                          title="Average / Market Price"
                          className="flex justify-end"
                        >
                          AVG/MKT Price
                          <SortByIcon disabled sortBy={sortBy} />
                        </span>
                      </th>
                      <th scope="col" className="px-3 py-3">
                        <span
                          title="Quantity"
                          className="flex cursor-pointer justify-end"
                          onClick={() => toggleOrderBy("quantity")}
                        >
                          QTY
                          <SortByIcon
                            active={orderBy === "quantity"}
                            sortBy={sortBy}
                          />
                        </span>
                      </th>
                      <th scope="col" className="px-3 py-3">
                        <span
                          title="Invested $"
                          className="flex cursor-pointer justify-end"
                          onClick={() => toggleOrderBy("totalInvested")}
                        >
                          INV $
                          <SortByIcon
                            active={orderBy === "totalInvested"}
                            sortBy={sortBy}
                          />
                        </span>
                      </th>
                      <th scope="col" className="px-3 py-3">
                        <span
                          title="Invested %"
                          className="text-nowrap flex cursor-pointer justify-end"
                          onClick={() =>
                            toggleOrderBy("totalInvestedPercentage")
                          }
                        >
                          INV %
                          <SortByIcon sortBy={sortBy} />
                        </span>
                      </th>
                      <th scope="col" className="px-3 py-3 align-start">
                        <span
                          title="Return on Investment $"
                          className="flex cursor-pointer justify-end"
                          onClick={() => toggleOrderBy("ppl")}
                        >
                          ROI $
                          <SortByIcon
                            active={orderBy === "ppl"}
                            sortBy={sortBy}
                          />
                        </span>
                      </th>
                      <th scope="col" className="px-3 py-3">
                        <span
                          title="Return on Investment %"
                          className="flex cursor-pointer justify-end"
                          onClick={() => toggleOrderBy("pplPercentage")}
                        >
                          ROI %
                          <SortByIcon
                            active={orderBy === "pplPercentage"}
                            sortBy={sortBy}
                          />
                        </span>
                      </th>
                      <th scope="col" className="px-3 py-3">
                        <span
                          title="Dividends $"
                          className="flex cursor-pointer justify-end"
                          onClick={() => toggleOrderBy("dividendTotal")}
                        >
                          DIV $
                          <SortByIcon
                            active={orderBy === "dividendTotal"}
                            sortBy={sortBy}
                          />
                        </span>
                      </th>
                      <th scope="col" className="px-3 py-3">
                        <span
                          title="Result"
                          className="flex cursor-pointer justify-end"
                          onClick={() => toggleOrderBy("pplAndDividends")}
                        >
                          Result
                          <SortByIcon
                            active={orderBy === "pplAndDividends"}
                            sortBy={sortBy}
                          />
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-500">
                    {instruments.map(renderRow)}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
