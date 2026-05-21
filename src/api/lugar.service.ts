import { Lugar } from "../types/Lugar";
import {supabase} from '../shared/api/supabase';

export const lugarService = {
    getAll: async (): Promise<Lugar[]> => {
        const {data, error} = await supabase
            .from('lugares')
            .select('*')
            .order('created_at', {ascending: false});

        if (error) throw new Error(error.message);
        return data ?? [];
    },

    getById: async (id: string): Promise<Lugar | null> => {
        const {data, error} = await supabase
            .from('lugares')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    add: async (lugar: Omit<Lugar, 'id' | 'created_at'>): Promise<Lugar> => {
        const {data, error} = await supabase
            .from('lugares')
            .insert(lugar)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    remove: async (id: string): Promise<void> => {
        const {error} = await supabase
            .from('lugares')
            .delete()
            .eq('id', id);

        if (error) throw new Error(error.message);
    },
};