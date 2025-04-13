import React from "react";
import clsx from "clsx";
import {
  Disclosure,
  DisclosureButton,
  Listbox,
  ListboxOptions,
  ListboxOption,
  Menu,
  Transition,
  Popover,
  PopoverButton,
  PopoverPanel,
  Label,
  ListboxButton,
  DisclosurePanel,
  MenuButton,
  MenuItems,
  MenuItem,
} from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  ArrowsUpDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckIcon,
  ChevronUpDownIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { SortBy } from "../types";

const user = {
  name: "Tom Cook",
  email: "tom@example.com",
  imageUrl:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
};

export type NavbarProps = {
  userNavigation: (
    | { name: string; href: string; onClick: () => void; disabled?: boolean }
    | "DIVIDER"
  )[];
};

export function Navbar({ userNavigation }: NavbarProps) {
  return (
    <Disclosure as="nav" className="bg-gray-800">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-12 items-center justify-between">
              <div className="flex items-center" />
              <div className="hidden md:block">
                <div className="ml-4 flex items-center md:ml-6">
                  {/* Profile dropdown */}
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <MenuButton className="relative flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                        <span className="absolute -inset-1.5" />
                        <span className="sr-only">Open user menu</span>
                        <img
                          className="h-8 w-8 rounded-full"
                          src={user.imageUrl}
                          alt=""
                        />
                      </MenuButton>
                    </div>
                    <Transition
                      as="span"
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {userNavigation.map((item, index) =>
                          item === "DIVIDER" ? (
                            <div
                              key={index}
                              className="my-1 h-px bg-gray-300"
                            />
                          ) : (
                            <MenuItem key={item.name}>
                              {({ focus, close }) => (
                                <a
                                  href={item.href}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    item.onClick();
                                    close();
                                  }}
                                  className={clsx(
                                    "block px-4 py-2 text-sm text-gray-700",
                                    {
                                      "bg-gray-100": focus,
                                      "opacity-50 cursor-not-allowed":
                                        item.disabled,
                                    }
                                  )}
                                >
                                  {item.name}
                                </a>
                              )}
                            </MenuItem>
                          )
                        )}
                      </MenuItems>
                    </Transition>
                  </Menu>
                </div>
              </div>
              <div className="-mr-2 flex md:hidden">
                {/* Mobile menu button */}
                <DisclosureButton className="relative inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </DisclosureButton>
              </div>
            </div>
          </div>

          <DisclosurePanel className="md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3" />
            <div className="border-t border-gray-700 pb-3 pt-4">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <img
                    className="h-10 w-10 rounded-full"
                    src={user.imageUrl}
                    alt=""
                  />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium leading-none text-white">
                    {user.name}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1 px-2">
                {userNavigation.map((item, index) =>
                  item === "DIVIDER" ? (
                    <div key={index} className="my-1 h-px bg-gray-300" />
                  ) : (
                    <DisclosureButton
                      key={item.name}
                      as="a"
                      href={item.href}
                      onClick={() => {
                        item.onClick();
                      }}
                      className={clsx(
                        "block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white",
                        {
                          "opacity-50 cursor-not-allowed": item.disabled,
                        }
                      )}
                    >
                      {item.name}
                    </DisclosureButton>
                  )
                )}
              </div>
            </div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}

export type DropdownOption = { name: string };
export function Dropdown<T extends DropdownOption>({
  placeholder,
  value,
  label,
  isLoading = false,
  options,
  onChange,
}: {
  placeholder?: string;
  value?: T | null;
  label?: string;
  isLoading?: boolean;
  options: T[];
  onChange?: (value: T) => void;
}) {
  return (
    <Listbox value={value} onChange={onChange}>
      {({ open }) => (
        <div>
          <Label className="block text-xs font-medium leading-6 text-gray-900">
            {label}
          </Label>
          <div className="relative">
            <ListboxButton className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
              <span className="flex items-center">
                <span className="ml-3 block truncate">
                  {isLoading ? <Spinner /> : value?.name || placeholder}
                </span>
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </ListboxButton>

            <Transition
              show={open}
              as="span"
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <ListboxOptions className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {options.map((item) => (
                  <ListboxOption
                    key={item.name}
                    className={({ active }) =>
                      clsx(
                        active ? "bg-indigo-600 text-white" : "text-gray-900",
                        "relative cursor-default select-none py-2 pl-3 pr-9"
                      )
                    }
                    value={item}
                  >
                    {({ selected, focus }) => (
                      <>
                        <div className="flex items-center">
                          <span
                            className={clsx(
                              selected ? "font-semibold" : "font-normal",
                              "ml-3 block truncate"
                            )}
                          >
                            {item.name}
                          </span>
                        </div>

                        {selected ? (
                          <span
                            className={clsx(
                              "absolute inset-y-0 right-0 flex items-center pr-4",
                              focus ? "text-white" : "text-indigo-600"
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Transition>
          </div>
        </div>
      )}
    </Listbox>
  );
}

export function Container({
  children,
  className,
}: React.PropsWithChildren & {
  className?: string;
}) {
  return (
    <div className={clsx("mx-auto max-w-7xl py-6 px-4 lg:px-8", className)}>
      {children}
    </div>
  );
}

export function Header({ title }: { title: string }) {
  return (
    <header className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {title}
        </h1>
      </div>
    </header>
  );
}

export type SpinnerProps = {
  size?: 3 | 5 | 12 | 24;
  color?: string;
  className?: string;
};

export function Spinner({
  size = 5,
  color = "text-blue-500",
  className,
}: SpinnerProps) {
  const selectedSize = {
    3: "w-3 h-3",
    5: "w-5 h-5",
    12: "w-12 h-12",
    24: "w-24 h-24",
  }[size];

  return (
    <span className={className}>
      <svg
        aria-hidden="true"
        role="status"
        className={`inline ${selectedSize} mr-3 ${color} animate-spin`}
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="#E5E7EB"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

export function SortByIcon({
  sortBy,
  active = false,
  disabled = false,
}: {
  sortBy: SortBy;
  active?: boolean;
  disabled?: boolean;
}) {
  const iconProps = {
    className: clsx("mx-1 h-3 w-3", {
      "opacity-20 cursor-not-allowed": disabled,
      "opacity-50": !active,
    }),
    "aria-hidden": true,
  };

  if (!active) {
    return <ArrowsUpDownIcon {...iconProps} />;
  }

  if (sortBy === "asc") return <ArrowDownIcon {...iconProps} />;
  if (sortBy === "desc") return <ArrowUpIcon {...iconProps} />;
  return <ArrowsUpDownIcon {...iconProps} />;
}

type PrivacyButtonProps = {
  active: boolean;
  className?: string;
  onClick: () => void;
};
export function PrivacyButton({
  active,
  className,
  onClick,
}: PrivacyButtonProps) {
  const iconProps = {
    className: clsx("h-5 w-5 aria-hidden", className, {
      "opacity-50": !active,
    }),
  };

  return (
    <button title="Active privacy mode" onClick={onClick}>
      {active ? <EyeSlashIcon {...iconProps} /> : <EyeIcon {...iconProps} />}
    </button>
  );
}

export function AccountBalanceSkeleton() {
  return (
    <div
      role="status"
      className="py-1 space-y-8 animate-pulse md:space-y-0 md:space-x-8 rtl:space-x-reverse md:flex md:items-center"
    >
      <div className="w-full">
        <div className="h-5 bg-gray-200 rounded-full dark:bg-gray-300 w-44 md:w-48 mb-5"></div>
        <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-300 w-32 mb-2.5"></div>
        <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-300 w-32 max-w-[480px] mb-2.5"></div>
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function PortfolioSkeleton() {
  return (
    <div>
      <div className="w-full animate-pulse">
        <div className="h-5 bg-gray-200 rounded-full dark:bg-gray-300 w-44 md:w-48 mb-5"></div>
      </div>
      <div
        role="status"
        className="p-4 animate-pulse rtl:space-x-reverse md:flex md:items-center rounded-md border border-gray-300 overflow-hidden"
      >
        <div className="w-full">
          <div className="space-y-4 divide-y divide-gray-200 rounded animate-pulse dark:divide-gray-300 dark:border-gray-300">
            {new Array(5).fill(null).map((_, index) => (
              <div
                key={index}
                className={clsx("flex items-center justify-between", {
                  "pt-5": index >= 1,
                })}
              >
                <div>
                  <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-300 w-24 mb-2.5"></div>
                  <div className="w-32 h-2 bg-gray-200 rounded-full dark:bg-gray-300"></div>
                </div>
                <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-300 w-12"></div>
              </div>
            ))}
          </div>
        </div>
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}

type ImageProps = {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
};
export function Image({
  className,
  src,
  alt,
  placeholder = "/placeholder.png",
}: ImageProps) {
  const [localSrc, setLocalSrc] = React.useState(src);

  const handleError = React.useCallback(() => {
    setLocalSrc(placeholder);
  }, [placeholder]);

  return (
    <img className={className} onError={handleError} src={localSrc} alt={alt} />
  );
}

const TOOLTIP_ANCHOR = { padding: 10, gap: 5 };

type TooltipProps = React.PropsWithChildren<{
  className?: string;
  offset?: number;
  trigger: React.ReactNode;
}>;
export const Tooltip = ({ className, trigger, children }: TooltipProps) => {
  return (
    <Popover>
      <PopoverButton
        as="span"
        className={clsx("flex active:outline-none", className)}
      >
        {trigger}
      </PopoverButton>
      <PopoverPanel
        anchor={TOOLTIP_ANCHOR}
        transition
        className="text-base shadow-lg ring-1 ring-black ring-opacity-5 bg-white rounded-md transition duration-200 ease-in-out [--anchor-gap:var(--spacing-5)] data-[closed]:-translate-y-1 data-[closed]:opacity-0"
      >
        {children}
      </PopoverPanel>
    </Popover>
  );
};
