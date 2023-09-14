export const invoker = (() => {
  /**
   * Throws error with the specified message when the predicate is true.
   * @param predicate Predicate or value throws error when true.
   * @param message Error message.
   */
  const throwIf = (predicate: boolean | (() => boolean), message: string) => {
    if (typeof predicate === "function" ? predicate() : predicate) throw new Error(message);
  };

  /**
   * Invokes one of two functions according to predicate.
   * @param predicate Predicate or value to check and invoke appropriate function.
   * @param whenTrue Function to invoke when predicate is true.
   * @param whenFalse Function to invoke when predicate is false.
   * @returns Invoked function's result or null.
   */
  const invoke = <TTrue, TFalse>(
    predicate: boolean | (() => boolean),
    functions?: { whenTrue?: () => TTrue; whenFalse?: () => TFalse }
  ): TTrue | TFalse | null => {
    functions = functions || {};
    const invokeFn = (fn?: Function) => (fn && fn()) || null;
    if (typeof predicate === "function" ? predicate() : predicate) {
      return invokeFn(functions.whenTrue);
    } else {
      return invokeFn(functions.whenFalse);
    }
  };

  /**
   * Invokes function when predicate is true.
   * @param predicate Predicate or value invokes callback function when true.
   * @param callbackFn Function to invoke when predicate is true.
   * @returns Function's result or null.
   */
  const invokeIf = <T>(predicate: boolean | (() => boolean), callbackFn?: () => T): T | null => {
    return invoke(predicate, { whenTrue: callbackFn });
  };

  // /**
  //  * Invokes function with object as parameter when object is not null. This function can be used instead of null checking.
  //  * @param callbackFn Function to invoke when object is not null.
  //  * @param obj Object to pass as parameter to callback function.
  //  * @returns Function's result or null.
  //  */
  // const invokeNullCheck = <TObj, TResultNull, TResultNotNull>(
  //   obj?: TObj | (() => TObj),
  //   functions?: { whenNull: () => TResultNull; whenNotNull: (obj: TObj) => TResultNotNull }
  // ): TResultNull | TResultNotNull | null => {
  //   if (!functions) return null;
  //   const notNull = !!obj;
  //   return invoke(notNull, {
  //     whenTrue: () => functions.whenNotNull?.(typeof obj === "function" ? (obj as Function)() : obj),
  //     whenFalse: functions.whenNull,
  //   });
  // };

  return { throwIf, invoke, invokeIf };
})();
