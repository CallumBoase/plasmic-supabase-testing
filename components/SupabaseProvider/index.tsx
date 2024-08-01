//@ts-nocheck
import React, { useState, useEffect, forwardRef, useCallback, useImperativeHandle } from "react";
import { useMutablePlasmicQueryData } from "@plasmicapp/query";
import { DataProvider } from "@plasmicapp/host";
import { v4 as uuid } from "uuid";
import { useDeepCompareMemo } from "use-deep-compare";

//Import custom createClient that creates the Supabase client based on component render within Plasmic vs Browser
import createClient from "../../utils/supabase/component";

import buildSupabaseQueryWithDynamicFilters, { type Filter, type OrderBy } from "../../utils/buildSupabaseQueryWithDynamicFilters";


//Declare types
type Row = {
    [key: string]: any;
  };
  
type Rows = {
    count?: number
    data: Row[] | null
};

type SupabaseProviderError = {
    errorId: string;
    summary: string;
    errorObject: any;
    actionAttempted: string;
    recordId: string | null;
    rowForSupabase: Row | Rows | null;
}

type MutationResponse = {
    data: Row | Rows | null
    error: SupabaseProviderError | null
}

interface Actions {
    //TODO: with optionality turned off (ie. no .select() after the .insert or .update), would add and edit return null or the standard api response code like 200 etc? A: Rows can be null and also it could be an empty Array of Rows. 
    addRow(rowForSupabase: any, shouldReturnRow: boolean): Promise<MutationResponse>;
    editRow(rowForSupabase: any, shouldReturnRow: boolean): Promise<MutationResponse>;
    deleteRow(id: any, shouldReturnRow: boolean): Promise<MutationResponse>;
    refetchRows(): Promise<void>;
    flexibleMutation(
        tableName: string,
        operation: "insert" | "update" | "delete" | "upsert",
        dataForSupabase: any,
        filters: Filter[] | undefined,
        shouldReturnRow: boolean,
      ): Promise<MutationResponse>;
      runRpc(
        rpcName: string,
        args: any,
      ): Promise<any>;
}

export interface SupabaseProviderProps {
    children: React.ReactNode;
    tableName: string;
    columns: string;
    filters: Filter[];
    orderBy: OrderBy[]
    limit?: number;
    offset?: number;
    uniqueIdentifierField: string;
    returnCount?: "none" | "exact" | "planned" | "estimated";
    onError?: ( supabaseProviderError: SupabaseProviderError ) => void;
    simulateRandomMutationErrors: boolean;
    queryName: string;
    className?: string;
}

//The component
export const SupabaseProvider = forwardRef<Actions, SupabaseProviderProps>(
    function SupabaseProvider(props, ref) {
        const {
            children,
            tableName,
            columns,
            filters,
            orderBy,
            limit,
            offset,
            uniqueIdentifierField,
            returnCount,
            onError,
            simulateRandomMutationErrors,
            queryName,
            className,
        } = props;

        const [isMutating, setIsMutating] = useState<boolean>(false);
        const [fetchError, setFetchError] = useState<SupabaseProviderError | null>(null);
        const memoizedFilters = useDeepCompareMemo(() => filters, [filters]);

        //Function to fetch records from Supabase
        const fetchData = async () => {

            setIsMutating(false);
            setFetchError(null);
            
            try {
                //Create new supabase client
                const supabase = createClient();

                //Build the query with dynamic filters that were passed as props to the component
                const supabaseQuery = buildSupabaseQueryWithDynamicFilters({
                    supabase,
                    tableName,
                    operation: 'select',
                    columns,
                    dataForSupabase: null,
                    filters: memoizedFilters,
                    orderBy,
                    limit,
                    offset,
                    returnCount,
                });

                //Initiate the query and await the response
                const { data, error, count } = await supabaseQuery;

                if (error) {
                    throw error;
                }

                return { data, count }

            } catch(err) {
                //build the error object
                console.error(err)
                const supabaseProviderError = {
                    errorId: uuid(),
                    summary: 'Error fetching records',
                    errorObject: err,
                    actionAttempted: 'read',
                    rowForSupabase: null,
                    recordId: null,
                };

                setFetchError(supabaseProviderError);
                if (onError && typeof onError === 'function') {
                    onError(supabaseProviderError);
                }
                throw(err);
            }
        }

        //Use the useMutablePlasmicQueryData hook to fetch the data
        //Works very similar to useSWR
        //Note that we pass filters, limit and offset along with queryName to ensure we create a new cache when they change
        //Avoiding issues like flash of old content while data is fetching with new filters or data is paginated
        //And the useMutablePlasmicQueryData not being recalled so an old version of fetchData with wrong filters is used
        const {
            data,
            //The error object from useSWR/useMutablePlasmicQueryData contains errors from mutation and fetch
            //We don't use it because we customise behaviour below, to give separate fetch & mutation behavior
            //error,
            mutate,
            isLoading,
        } = useMutablePlasmicQueryData([queryName, JSON.stringify(filters), limit, offset, returnCount], fetchData, {
            shouldRetryOnError: false
        });

        //When fetchData function is rebuilt, re-fetch the data
        useEffect(() => {
            mutate();
        }, [tableName, columns, memoizedFilters, limit, offset, returnCount]);


        //Function to actually add row to Supabase via an API call
        const addRow = useCallback(
            async (rowForSupabase: Row, shouldReturnRow: boolean) : Promise<Rows> => {
      
              if(simulateRandomMutationErrors && Math.random() > 0.5) {
                //1 second delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                throw new Error('Simulated error adding record');
              }
      
              //Add the record to Supabase
              const supabase = createClient();

              let query = supabase
                .from(tableName)
                .insert(rowForSupabase)
              
              if (shouldReturnRow) { query = query.select() }
            
              const { data, error } = await query;

              if (error) {
                throw error;
              }                                     
              
              return shouldReturnRow ?  data : [] //if not specified to return the added row, return an empty array to indicate success
            },
            [tableName, simulateRandomMutationErrors]
        );

        //Function to actually edit row in Supabase via an API call
        const editRow = useCallback(
            async (rowForSupabase: Row, shouldReturnRow: boolean) : Promise<Rows> => {
      
              if(simulateRandomMutationErrors && Math.random() > 0.5) {
                //1 second delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                throw new Error('Simulated error editing record');
              }
      
              //Update the record in Supabase
              const supabase = createClient();

              let query = supabase
                .from(tableName)
                .update(rowForSupabase)
                .eq(uniqueIdentifierField, rowForSupabase[uniqueIdentifierField])
              
              if (shouldReturnRow) { query = query.select() }
            
              const { data, error } = await query;

              if (error) {
                throw error;
              }                                     
              
              return shouldReturnRow ?  data : [] //if not specified to return the added row, return an empty array to indicate success
            },
            [tableName, simulateRandomMutationErrors, uniqueIdentifierField]
        );

        //Function to actually delete row in Supabase via an API call
        const deleteRow = useCallback(
            async (uniqueIdentifierValue: number | string, shouldReturnRow: boolean) : Promise<Rows> => {
      
              if(simulateRandomMutationErrors && Math.random() > 0.5) {
                //1 second delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                throw new Error('Simulated error deleting record');
              }
      
              //Update the record in Supabase
              const supabase = createClient();

              let query = supabase
                .from(tableName)
                .delete()
                .eq(uniqueIdentifierField, uniqueIdentifierValue)
              
              if (shouldReturnRow) { query = query.select() }
            
              const { data, error } = await query;

              if (error) {
                throw error;
              }                                     
              
              return shouldReturnRow ?  data : [] //if not specified to return the added row, return an empty array to indicate success
            },
            [tableName, simulateRandomMutationErrors, uniqueIdentifierField]
        );

        const flexibleMutation = useCallback(
            async (
              tableName: string,
              operation: "insert" | "update" | "delete" | "upsert",
              dataForSupabase: Row,
              filters: Filter[] | undefined,
              shouldReturnRow: boolean
            ) : Promise<Rows> => {

            if(simulateRandomMutationErrors && Math.random() > 0.5) {
                //1 second delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                throw new Error('Simulated error deleting record');
            }
      
              //New supabase client
              const supabase = createClient();
      
              //Check for obvious errors
              if( ["insert", "update", "upsert", "delete"].includes(operation) === false ) {
                throw new Error('Flexible query error: Invalid operation. Allowed options are "insert", "update", "upsert", or "delete"');
              }
      
              if(operation !== "delete" && !dataForSupabase) {
                throw new Error('Flexible query error: You must provide dataForSupabase when running operations: insert, update or upsert.');
              }
      
              if(operation === "delete" || operation === "update") {
                if(!filters || filters.length === 0) {
                  throw new Error('Flexible query error: You must provide at least one filter when running operations: update or delete.');
                }
              }
      
              //Build the flexible mutation
              let query = buildSupabaseQueryWithDynamicFilters({
                supabase,
                tableName,
                operation,
                columns: null,
                dataForSupabase,
                filters
              });
      
              //Run the flexible mutation
              if (shouldReturnRow) { query = query.select() }
              
              const { data, error } = await query;
              
              if (error) {
                throw error;
              }                                     
              
              return shouldReturnRow ?  data : [] //if not specified to return the added row, return an empty array to indicate success
            },
            [simulateRandomMutationErrors]
        )

        //Function to run an RPC (database function) in supabase
        const rpc = useCallback(
            async (
            rpcName: string,
            args: any,
            ) => {
    
                if(simulateRandomMutationErrors && Math.random() > 0.5) {
                    //1 second delay
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    throw new Error('Simulated error deleting record');
                }
        
                //Run the RPC
                const supabase = createClient();

                let query = supabase.rpc(rpcName, args);
                const { data, error } = await query;

                console.log(data)
                console.error(error)
                
                if (error) {
                    throw error;
                }                                                   
                return data //if the function returns void, this would currently by null. Error would also be null.
            },
            [simulateRandomMutationErrors]
        );


        //Define element actions to run from Plasmic Studio
        useImperativeHandle(ref, () => ({
            //Element action to add a record & auto-refetch when done
            addRow: async (rowForSupabase, shouldReturnRow = false) => { // default values for backward compatibility
                setIsMutating(true);
        
                //Run the mutation
                try {
                    const result = await mutate(addRow(rowForSupabase, shouldReturnRow), {
                    populateCache: false,
                    revalidate: true,
                    rollbackOnError: true
                    });
                    return { data: result, error: null };
        
                } catch(err) {
                    console.error(err)
                    const supabaseProviderError = {
                    errorId: uuid(),
                    summary: 'Error adding row',
                    errorObject: err,
                    actionAttempted: 'insert',
                    rowForSupabase: rowForSupabase || null,
                    recordId: null
                    };
                    if (onError && typeof onError === 'function') {
                        onError(supabaseProviderError);
                    }
                    return { data: null, error: supabaseProviderError };
                }
            },

            //Element action to edit a record and auto-refetch when done
            editRow: async (rowForSupabase, shouldReturnRow = false) => { // default values for backward compatibility
                setIsMutating(true);
        
                //Run the mutation
                try {
                    const result = await mutate(editRow(rowForSupabase, shouldReturnRow), {
                    populateCache: false,
                    revalidate: true,
                    rollbackOnError: true
                    });
                    return { data: result, error: null };
        
                } catch(err) {
                    console.error(err)
                    const supabaseProviderError = {
                    errorId: uuid(),
                    summary: 'Error editing row',
                    errorObject: err,
                    actionAttempted: 'update',
                    rowForSupabase: rowForSupabase || null,
                    recordId: rowForSupabase[uniqueIdentifierField]
                    };
                    if (onError && typeof onError === 'function') {
                        onError(supabaseProviderError);
                    }
                    return { data: null, error: supabaseProviderError };
                }
            },
        

            //Element action to delete a record and auto-refetch when done
            deleteRow: async (uniqueIdentifierValue, shouldReturnRow = false) => { // default values for backward compatibility
                setIsMutating(true);
        
                //Run the mutation
                try {
                    const result = await mutate(deleteRow(uniqueIdentifierValue, shouldReturnRow), {
                    populateCache: false,
                    revalidate: true,
                    rollbackOnError: true
                    });
                    return { data: result, error: null };
        
                } catch(err) {
                    console.error(err)
                    const supabaseProviderError = {
                    errorId: uuid(),
                    summary: 'Error deleting row',
                    errorObject: err,
                    actionAttempted: 'delete',
                    rowForSupabase: null,
                    recordId: uniqueIdentifierValue
                    };
                    if (onError && typeof onError === 'function') {
                        onError(supabaseProviderError);
                    }
                    return { data: null, error: supabaseProviderError };
                }
            },

            //Element action to simply refetch the data with the fetcher
            refetchRows: async () => {
                try {
                    mutate()
                } catch(err) {
                    console.error(err)
                    const supabaseProviderError = {
                    errorId: uuid(),
                    summary: 'Error refetching rows',
                    errorObject: err,
                    actionAttempted: 'read',
                    rowForSupabase: null,
                    recordId: null
                    };
                    if (onError && typeof onError === 'function') {
                        onError(supabaseProviderError);
                    }
                    return { data: null, error: supabaseProviderError };
                }
            },

            //Element action to run a more flexible mutation with less checks auto-refetch when done
            flexibleMutation: async (
                tableName,
                operation,
                dataForSupabase,
                filters,
                shouldReturnRow = false
            ) => { // default values for backward compatibility
                setIsMutating(true);
        
                //Run the mutation
                try {
                    const result = await mutate(flexibleMutation(tableName, operation, dataForSupabase, filters, shouldReturnRow), {
                    populateCache: false,
                    revalidate: true,
                    rollbackOnError: true
                    });
                    return { data: result, error: null };
        
                } catch(err) {
                    console.error(err)
                    const supabaseProviderError = {
                    errorId: uuid(),
                    summary: 'Error with flexible mutation',
                    errorObject: err,
                    actionAttempted: operation,
                    rowForSupabase: dataForSupabase || null,
                    recordId: null //filters?.forEach((filter) => {filter.fieldName, filter.value, filter.value2})
                    };
                    if (onError && typeof onError === 'function') {
                        onError(supabaseProviderError);
                    }
                    return { data: null, error: supabaseProviderError };
                }
            },

            runRpc: async (
                rpcName, 
                args,
            ) => {
                setIsMutating(true);

                //Run the mutation
                try {
                    const result = await mutate(rpc(rpcName, args), {
                    populateCache: false,
                    revalidate: true,
                    rollbackOnError: true
                    });
                    return { data: result, error: null };
        
                } catch(err) {
                    console.error(err)
                    const supabaseProviderError = {
                    errorId: uuid(),
                    summary: 'Error with RPC',
                    errorObject: err,
                    actionAttempted: "rpc",
                    rowForSupabase: args || null,
                    recordId: null
                    };
                    if (onError && typeof onError === 'function') {
                        onError(supabaseProviderError);
                    }
                    return { data: null, error: supabaseProviderError };
                }
            },


        }
    ));
    

        return (
            <div className={className}>
                <DataProvider
                name={queryName}
                data={{ data: data?.data, count: data?.count, isLoading, isMutating, fetchError }}
                >
                {children}
                </DataProvider>
            </div>
        );
    }
);