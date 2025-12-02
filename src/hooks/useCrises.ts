import { useState, useMemo } from 'react';
import { Crisis, Charity, FilterState, Category, Severity } from '@/types';
import { mockCrises, mockCharities } from '@/data/mockData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function useCrises() {
  const [crises] = useState<Crisis[]>(mockCrises);
  const [charities] = useState<Charity[]>(mockCharities);
  const [selectedCrisis, setSelectedCrisis] = useState<Crisis | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: null,
    severity: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const filteredCrises = useMemo(() => {
    return crises.filter((crisis) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          crisis.title.toLowerCase().includes(searchLower) ||
          crisis.summary.toLowerCase().includes(searchLower) ||
          crisis.country.toLowerCase().includes(searchLower) ||
          crisis.description.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (filters.category && crisis.category !== filters.category) {
        return false;
      }

      // Severity filter
      if (filters.severity && crisis.severity !== filters.severity) {
        return false;
      }

      return true;
    });
  }, [crises, filters]);

  const getCharitiesForCrisis = (crisisId: number): Charity[] => {
    return charities.filter((charity) => charity.crisis_id === crisisId);
  };

  const updateSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  };

  const updateCategory = (category: Category | null) => {
    setFilters((prev) => ({ ...prev, category }));
  };

  const updateSeverity = (severity: Severity | null) => {
    setFilters((prev) => ({ ...prev, severity }));
  };

  const clearFilters = () => {
    setFilters({ search: '', category: null, severity: null });
  };

  return {
    crises: filteredCrises,
    allCrises: crises,
    charities,
    selectedCrisis,
    setSelectedCrisis,
    filters,
    updateSearch,
    updateCategory,
    updateSeverity,
    clearFilters,
    getCharitiesForCrisis,
    isLoading,
  };
}
