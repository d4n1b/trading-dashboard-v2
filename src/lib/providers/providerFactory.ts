import { Trading212Provider } from "./trading212/api";
import { TradingProvider, TradingProviderOptions } from "./provider";

export class ProviderFactory {
  static getProvider(options: TradingProviderOptions): TradingProvider {
    const { account } = options;
    switch (account.provider) {
      case "trading_212":
        return new Trading212Provider(options);
      default:
        throw new Error(`Unsupported provider: ${options.account.provider}`);
    }
  }
}
