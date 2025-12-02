import { useState } from 'react';
import { Header } from '@/components/Header';
import { FiltersBar } from '@/components/FiltersBar';
import { CrisisList } from '@/components/CrisisList';
import { CrisisDetailsPanel } from '@/components/CrisisDetailsPanel';
import { MapView } from '@/components/MapView';
import { useCrises } from '@/hooks/useCrises';
import { X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IndexProps {
  onLogout?: () => void;
}

const Index = ({ onLogout }: IndexProps) => {
  const {
    crises,
    selectedCrisis,
    setSelectedCrisis,
    filters,
    updateSearch,
    updateCategory,
    updateSeverity,
    clearFilters,
    getCharitiesForCrisis,
    isLoading,
  } = useCrises();

  const [showMobileDetails, setShowMobileDetails] = useState(false);

  const handleSelectCrisis = (crisis: typeof selectedCrisis) => {
    setSelectedCrisis(crisis);
    if (crisis) {
      setShowMobileDetails(true);
    }
  };

  const handleCloseDetails = () => {
    setSelectedCrisis(null);
    setShowMobileDetails(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header>
        {onLogout && (
          <Button
            onClick={onLogout}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        )}
      </Header>
      
      <main className="pt-16 h-screen flex flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full lg:w-96 xl:w-[420px] h-[40vh] lg:h-full border-b lg:border-b-0 lg:border-r border-border/30 flex flex-col bg-background/50 backdrop-blur-sm">
          {/* Filters */}
          <div className="p-4 border-b border-border/30">
            <FiltersBar
              search={filters.search}
              onSearchChange={updateSearch}
              selectedCategory={filters.category}
              onCategoryChange={updateCategory}
              selectedSeverity={filters.severity}
              onSeverityChange={updateSeverity}
              onClear={clearFilters}
            />
          </div>
          
          {/* Crisis List */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
            <CrisisList
              crises={crises}
              selectedCrisis={selectedCrisis}
              onSelectCrisis={handleSelectCrisis}
              isLoading={isLoading}
            />
          </div>
        </aside>

        {/* Map + Details */}
        <div className="flex-1 relative flex">
          {/* Map */}
          <div className="flex-1 p-4">
            <MapView
              crises={crises}
              selectedCrisis={selectedCrisis}
              onSelectCrisis={handleSelectCrisis}
            />
          </div>

          {/* Details Panel - Desktop */}
          {selectedCrisis && (
            <div className="hidden lg:block w-96 xl:w-[420px] p-4 pl-0">
              <CrisisDetailsPanel
                crisis={selectedCrisis}
                charities={getCharitiesForCrisis(selectedCrisis.id)}
                onClose={handleCloseDetails}
              />
            </div>
          )}
        </div>

        {/* Mobile Details Sheet */}
        {showMobileDetails && selectedCrisis && (
          <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="absolute inset-x-0 bottom-0 top-20 bg-background rounded-t-3xl animate-slide-up">
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-border rounded-full" />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseDetails}
                className="absolute top-4 right-4 z-10"
              >
                <X className="w-5 h-5" />
              </Button>
              <div className="h-full overflow-y-auto pt-8 px-4 pb-4">
                <CrisisDetailsPanel
                  crisis={selectedCrisis}
                  charities={getCharitiesForCrisis(selectedCrisis.id)}
                  onClose={handleCloseDetails}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
