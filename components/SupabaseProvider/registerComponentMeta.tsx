import { CodeComponentMeta } from "@plasmicapp/host";
import { SupabaseProviderProps } from ".";

//Component metadata for registration in Plasmic
export const SupabaseProviderMeta : CodeComponentMeta<SupabaseProviderProps> = {
  name: "SupabaseProvider",
  importPath: "./index",
  providesData: true,
  props: {
    queryName: {
      type: "string",
      required: true,
    },
    tableName: {
      type: "string",
      required: true,
    },
    columns: {
      type: "string",
      defaultValue: "*",
    },
    filters: {
      type: "array",
      itemType: {
        type: "object",
        fields: {
          fieldName: "string",
          operator: {
            type: "choice",
            options: [
              {
                value: "eq",
                label: "is equal to (eq)"
              },
              {
                value: "neq",
                label: "not equal to (neq)"
              },
              {
                value: "gt",
                label: "greater than (gt)"
              },
              {
                value: "gte",
                label: "greater than or equal to (gte)"
              },
              {
                value: "lt",
                label: "less than (lt)"
              },
              {
                value: "lte",
                label: "less than or equal to (lte)"
              },
              {
                value: "like",
                label: "matches a case-sensitive pattern (like)"
              },
              {
                value: "ilike",
                label: "matches a case-insensitive pattern (ilike)"
              },
              {
                value: "is",
                label: "is (is)"
              },
              {
                value: "in",
                label: "is in an array (in)"
              },
              {
                value: "contains",
                label: "contains every element in (contains)"
              },
              {
                value: "containedBy",
                label: "contained by (containedby)"
              },
              {
                value: "rangeGt",
                label: "greater than range (rangeGt)"
              },
              {
                value: "rangeGte",
                label: "greater than or equal to range (rangeGte)"
              },
              {
                value: "rangeLt",
                label: "less than range (rangeLt)"
              },
              {
                value: "rangeLte",
                label: "less than or equal to range (rangeLte)"
              },
              {
                value: "rangeAdjacent",
                label: "is mutually exclusive to range (rangeAdjacent)"
              },
              {
                value: "overlaps",
                label: "has an element in common with (overlaps)"
              },
              {
                value: "match",
                label: "where each { column:value, ... } matches (match)"
              },
              {
                value: "or",
                label: "that matches at least one PostgREST filter (or)"
              },
              {
                value: "textSearch",
                label: "matches the query string (textSearch)"
              },
              {
                value: "not",
                label: "that doesn't match the PostgREST filter (not)"
              },
            ]
          },
          value: "string",
          value2: "string",
        },
      },
      description:
        "Filters to execute during the query. Acceptable values are eq, neq, gt, lt, gte, lte.",
    },
    orderBy: {
      type: "array",
      itemType: {
        type: "object",
        fields: {
          fieldName: "string",
          direction: {
            type: "choice",
            options:  [
              {label: "Ascending",value: "asc"}, 
              {label: "Descending",value: "desc"}
            ],
          },
        },
      },
      displayName: "Order by",
      description:
        "Columns to order the results by during the query.",
    },
    /*initialSortField: "string",
    initialSortDirection: {
      type: "choice",
      options: ["asc", "desc"],
    },*/
    uniqueIdentifierField: {
      type: "string",
      required: true,
      defaultValue: "id",
    },
    /*hideDefaultErrors: {
      type: 'boolean',
      advanced: true,
      description: 'Hide default errors so you can use the $ctx values yourself to show custom error messages'
    },*/
    forceMutationError: {
      type: "boolean",
      advanced: true,
    },
    /*forceValidating: {
      type: "boolean",
      advanced: true,
    },
    forceNoData: {
      type: "boolean",
      advanced: true,
    },
    forceQueryError: {
      type: "boolean",
      advanced: true,
    },
    forceMutationError: {
      type: "boolean",
      advanced: true,
    },*/
    limit: {
      type: "number",
      step: 1,
      min: 0,
      required: false,
      description: 'Number of records to fetch',
      advanced: true,
    },
    offset: {
      type: "number",
      step: 1,
      min: 0,
      required: false,
      description: 'Number of records to skip',
      advanced: true,
    },
    returnCount: {
      type: "choice",
      options: ["none", "exact", "planned", "estimated"],
      defaultValue: "none",
      required: false,
      description: 'Count algorithm to use to count rows in the table or view. `"none"`: Don\'t return a count. `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the hood. `"planned"`: Approximated but fast count algorithm. Uses the Postgres statistics under the hood. `"estimated"`: Uses exact count for low numbers and planned count for high numbers.',
      advanced: true,
    },
    onError: {
      type: "eventHandler",
      argTypes: [{name: 'supabaseProviderError', type: 'object'}],
      required: false,
    },
    disableFetchData: {
      type: 'boolean',
      displayName: "Disable data fetching",
      advanced: true,
      description: 'Disable data fetching. Useful for when you want to just use element actions without fetching data first, eg to use the SupabaseProvider to add a row on a page where you are not displaying other rows.'
    },
    simulateRandomMutationErrors: {
      type: "boolean",
      advanced: true,
    },
    /*loading: {
      type: "slot",
      defaultValue: {
        type: "text",
        value: "Loading...",
      },
    },*/
    /*validating: {
      type: "slot",
      defaultValue: {
        type: "text",
        value: "Validating...",
      },
    },
    noData: {
      type: "slot",
      defaultValue: {
        type: "text",
        value: "No data",
      },
    },*/
    children: {
      type: "slot",
      defaultValue: [
        {
          type: "text",
          value:
            `INSTRUCTIONS FOR SUPABASE PROVIDER:
            1. Click the new SupabaseProvider component in the Component tree (LHS of screen) to open it's settings
            2. In settings on RHS of screen, choose a globally unique "Query name" (eg "/pagename/staff")
            3. Enter the correct "table name" from Supabase (eg "staff")
            4. On LHS of screen, change the name of SupabaseProvider to match the query name
            5. Delete this placeholder text (from "children" slot). Then add components to "children" and use the dynamic data as you wish! :)`,
        },
      ],
    },
  },
  refActions: {
    sortRows: {
      description: "sort rows",
      argTypes: [
        { name: "sortField", type: "string" },
        { name: "sortDirection", type: "string" },
      ],
    },
    refetchRows: {
      description: "refetch rows from the database",
      argTypes: [],
    },
    deleteRow: {
      description: "delete a row by ID",
      argTypes: [
        { name: "ID", type: "string", displayName: "Id / unique identifier of the row to delete" },
        { name: "shouldReturnRow", type: "boolean", displayName: "Return added row/s? (Returns [] if false)"},
        { name: "returnImmediately", type: "boolean"}
      ],
    },
    addRow: {
      description: "add a row",
      argTypes: [
        { name: "rowForSupabase", type: "object", displayName: "Row object to send to Supabase"},
        { name: "shouldReturnRow", type: "boolean", displayName: "Return mutated row/s? (Returns [] if false)"},
        { name: "returnImmediately", type: "boolean"}
      ],
    },
    editRow: {
      description: "edit row",
      argTypes: [
        { name: "rowForSupabase", type: "object", displayName: "Row object to send to Supabase"},
        { name: "shouldReturnRow", type: "boolean", displayName: "Return edited row/s? (Returns [] if false)"},
        { name: "returnImmediately", type: "boolean"}
      ],
    },
    flexibleMutation: {
      description: "perform a flexible mutation",
      argTypes: [
        { name: "tableName", type: "string", displayName: "Table name (to run mutation on)"},
        { name: "operation", type: "string", displayName: "Operation (insert / update / upsert / delete)" },
        { name: "dataForSupabase", type: "object", displayName: "Data for Supabase API call (leave blank for delete)" },
        { 
          name: "filters", 
          type: "object", 
          displayName: "Filters for update/delete (array of objects eg {fieldName: 'id', operator: 'eq', value: 1, value2: null})" 
        },
        { name: "shouldReturnRow", type: "boolean", displayName: "Return mutated row/s? (Returns [] if false)"},
        { name: "returnImmediately", type: "boolean"}
      ],
    },
    runRpc: {
      description: 'RPC for add row',
      argTypes: [
        { name: "rpcName", displayName: 'Name of the RPC', type: "string" },
        { name: "args", displayName: 'Arguments object for database function', type: "object"},
        { name: "returnImmediately", type: "boolean"}
      ]
    },
    clearError: {
      description: "clear the latest error message",
      argTypes: [],
    },
  },
}