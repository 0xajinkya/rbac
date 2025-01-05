import { IContext } from "@interfaces/common";
import { Context } from "@theinternetfolks/context";
import { PlatformError } from "@universe/errors";

const GetSession = () => {
    const { session } = Context.get<IContext>();
  
    if (!session) {
      throw new PlatformError("AccountNotFound");
    }
  
    return session;
  };

export const ContextService = {
    GetSession
}