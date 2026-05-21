import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { lugarService } from '../api/lugar.service';
import { Lugar } from '../types/Lugar';

const KEY = ['lugares'] as const;

export function useLugares() {
    return useQuery({
        queryKey: ['lugares'],
        queryFn: () => {
            console.log('Get ejecutado - se fue a la red');
            return lugarService.getAll();
        },
        staleTime: 1000 * 60 * 5
    });
}

export function useAgregarLugar() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (lugar: Omit<Lugar, 'id' | 'created_at'>) => lugarService.add(lugar),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
}

export function useEliminarLugar() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => lugarService.remove(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
}