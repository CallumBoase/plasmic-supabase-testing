import React, {
  useState,
  useEffect,
  forwardRef,
  useCallback,
  useImperativeHandle,
} from "react";

import { useMutablePlasmicQueryData } from "@plasmicapp/query";
import { DataProvider } from "@plasmicapp/host";
import { v4 as uuid } from "uuid";
import { useDeepCompareMemo } from "use-deep-compare";

import buildSupabaseQueryWithDynamicFilters, {
  type Filter,
  type OrderBy,
} from "../../utils/buildSupabaseQueryWithDynamicFilters";

export interface SupabaseProviderNewProps {
  children: React.ReactNode;
  className?: string;
}

interface Actions {
  addRow(
    rowForSupabase: any,
    shouldReturnRow: boolean,
    returnImmediately: boolean
  ): Promise<any>;
}


export const SupabaseProviderNew = forwardRef<Actions, SupabaseProviderNewProps>(
  function SupabaseProvider(props, ref) {

    const {
      children,
      className,
    } = props;

    useImperativeHandle(ref, () => ({
      addRow: async () => console.log("test"),
    }));

    return (
      <div className={className}>
        <DataProvider
          name="SupabaseProviderNew"
          data={{
            a: "b",
          }}
        >
          {children}
        </DataProvider>
      </div>
    );
  }
);