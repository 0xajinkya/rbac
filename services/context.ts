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
  /**
   * Retrieves the current session from the context.
   * 
   * @function GetSession
   * @returns {TCommonUser} - The session object containing the user's data.
   * 
   * @throws {PlatformError} - Throws a PlatformError if no session is found.
   */
    GetSession
}