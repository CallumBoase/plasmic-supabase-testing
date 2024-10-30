import { CodeComponentMeta } from "@plasmicapp/host";
import { SupabaseProviderNewProps } from ".";

export const SupabaseProviderNewMeta : CodeComponentMeta<SupabaseProviderNewProps> = {
  name: "SupabaseProviderNew",
  importPath: "./index",
  providesData: true,
  props: {
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
  }
};