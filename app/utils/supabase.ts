import {createClient} from "@supabase/supabase-js";
import AppConfig from "../config";

export const supabaseClient = createClient(AppConfig.SUPABASE_URL, AppConfig.SUPABASE_KEY);
