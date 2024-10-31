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

//Import custom createClient that creates the Supabase client based on component render within Plasmic vs Browser
import createClient from "../../utils/supabase/component";

import buildSupabaseQueryWithDynamicFilters, {
  type Filter,
  type OrderBy,
} from "../../utils/buildSupabaseQueryWithDynamicFilters";

type Row = {
  [key: string]: any;
};

type Rows = {
  count?: number;
  data: Row[] | null;
};

export interface SupabaseProviderNewProps {
  children: React.ReactNode;
  className?: string;
  queryName: string;
  tableName: string;
  columns: string;
  filters: Filter[];
  orderBy: OrderBy[];
  limit?: number;
  offset?: number;
  returnCount?: "none" | "exact" | "planned" | "estimated";
  onError: (supabaseProviderError: SupabaseProviderError) => void;
}

type SupabaseProviderError = {
  errorId: string;
  summary: string;
  errorObject: any;
  actionAttempted: string;
  rowForSupabase: Row | null;
};

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
      queryName,
      tableName,
      columns,
      filters,
      orderBy,
      limit,
      offset,
      returnCount,
      onError,
    } = props;

    // console.log(props)

    const [fetchError, setFetchError] = useState<SupabaseProviderError | null>(null);
    const memoizedFilters = useDeepCompareMemo(() => filters, [filters]);
    const memoizedOrderBy = useDeepCompareMemo(() => orderBy, [orderBy]);

    // Function to fetch rows from Supabase
    const fetchData = async () => {

      setFetchError(null);

      try {

        const supabase = createClient();

        //Build the query with dynamic filters that were passed as props to the component
        const supabaseQuery = buildSupabaseQueryWithDynamicFilters({
          supabase,
          tableName,
          operation: "select",
          columns,
          dataForSupabase: null,
          filters: memoizedFilters,
          orderBy,
          limit,
          offset,
          returnCount,
        });

        const { data, error, count } = await supabaseQuery;

        if (error) {
          throw error;
        }

        return { data, count };

      } catch (err) {
        console.error(err);
        const supabaseProviderError = {
          errorId: uuid(),
          summary: "Error fetching records",
          errorObject: err,
          actionAttempted: "read",
          rowForSupabase: null,
        };
        setFetchError(supabaseProviderError);
        if (onError && typeof onError === "function") {
          onError(supabaseProviderError);
        }
        throw err;
      }

    }

    const {
      data,
      //error - will not use see notes in KnackProvider
      // mutate,
      isLoading,
    } = useMutablePlasmicQueryData(
      [
        queryName, 
        JSON.stringify(memoizedFilters), 
        JSON.stringify(memoizedOrderBy)
      ], 
      fetchData,
      {
        shouldRetryOnError: false
      }
    );

    // Element actions
    useImperativeHandle(ref, () => ({
      addRow: async () => console.log("test"),
    }));

    return (
      <div className={className}>
        <DataProvider
          name={queryName}
          data={{
            data,
            isLoading,
            fetchError,
          }}
        >
          {children}
        </DataProvider>
      </div>
    );
  }
);