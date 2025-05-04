import { UserAccountV2 } from "@/types.v2";
import { DividendItemPayloadV2 } from "@/types.v2";
import { Trading212Provider } from "./trading212/api";

export interface TradingProvider {
  getDividends(): Promise<DividendItemPayloadV2[]>;
}

export class ProviderFactory {
  static getProvider(account: UserAccountV2): TradingProvider {
    switch (account.provider) {
      case "trading_212":
        return new Trading212Provider(account);
      default:
        throw new Error(`Unsupported provider: ${account.provider}`);
    }
  }
}
