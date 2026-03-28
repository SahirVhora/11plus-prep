import { useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { getRegionById, REGIONS, DEFAULT_REGION_ID } from '../data/regions';
import type { RegionConfig } from '../data/regions';

export function useRegion() {
  const { state, dispatch } = useApp();

  const region: RegionConfig =
    getRegionById(state.regionId) ?? getRegionById(DEFAULT_REGION_ID)!;

  const setRegion = useCallback(
    (regionId: string) => {
      dispatch({ type: 'SET_REGION', payload: regionId });
    },
    [dispatch]
  );

  return {
    region,
    regionId: state.regionId,
    setRegion,
    allRegions: REGIONS,
  };
}
