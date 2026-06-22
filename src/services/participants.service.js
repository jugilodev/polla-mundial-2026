import { supabase } from "../lib/supabase";

export async function getParticipants() {
    const { data, error } = await supabase
        .from("participants")
        .select("*")
        .order("name");

    if (error) throw error;

    return data;
}

export async function getParticipantById(id) {
    const { data, error } = await supabase
        .from("participants")
        .select("*")
        .eq("id", id)
        .single();

    if (error) throw error;

    return data;
}