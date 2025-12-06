import { useState, useMemo, useEffect } from 'react';
import { Crisis, Charity, FilterState, Category, Severity } from '@/types';

// Use relative URLs - Vite proxy forwards /api to backend
const API_URL = '';

export function useCrises() {
  const [crises, setCrises] = useState<Crisis[]>([]);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [selectedCrisis, setSelectedCrisis] = useState<Crisis | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: null,
    severity: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch crises from API
  useEffect(() => {
    const fetchCrises = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching crises from: /api/crises/');
        const response = await fetch('/api/crises/', {
          credentials: 'include', // Include cookies for same-origin
        });
        if (response.ok) {
          const data = await response.json();
          // API returns { crises: [...] } so extract the array
          const crisesArray = Array.isArray(data) ? data : data.crises || [];
          console.log('Fetched crises:', crisesArray.length);
          setCrises(crisesArray);
        } else {
          console.error('Failed to fetch crises:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching crises:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCrises();
  }, []);

  // Fetch charities from API
  useEffect(() => {
    const fetchCharities = async () => {
      try {
        console.log('Fetching charities from: /api/charities/');
        const response = await fetch('/api/charities/', {
          credentials: 'include', // Include cookies for same-origin
        });
        if (response.ok) {
          const data = await response.json();
          // API returns { charities: [...] } so extract the array
          const charitiesArray = Array.isArray(data) ? data : data.charities || [];
          console.log('Fetched charities:', charitiesArray.length);
          setCharities(charitiesArray);
        } else {
          console.error('Failed to fetch charities:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching charities:', error);
      }
    };

    fetchCharities();
  }, []);

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
    const filtered = charities.filter((charity) => charity.crisis_id === crisisId);
    console.log(`Getting charities for crisis ${crisisId}:`, filtered.length, 'found');
    return filtered;
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
