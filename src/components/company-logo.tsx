import React from "react";

import {
  Trading212ShortNameTickerMap,
  Trading212TickerShortNameMap,
} from "@/config";

type CompanyLogoProps = {
  ticker: string;
  internalTicker: string;
  alt: string;
  className?: string;
  placeholderUrl?: string;
};
export function CompanyLogo({
  className,
  ticker,
  internalTicker,
  alt,
  placeholderUrl = "/placeholder.png",
}: CompanyLogoProps) {
  const parsedTicker =
    Trading212ShortNameTickerMap[ticker] ||
    Trading212TickerShortNameMap[ticker] ||
    internalTicker;

  const [localSrc, setLocalSrc] = React.useState(
    `https://trading212equities.s3.eu-central-1.amazonaws.com/${parsedTicker}.png`
  );

  const handleError = React.useCallback(() => {
    setLocalSrc(placeholderUrl);
  }, [placeholderUrl]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={className} onError={handleError} src={localSrc} alt={alt} />
  );
}
