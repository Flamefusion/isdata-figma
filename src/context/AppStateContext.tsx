import React, { createContext, useContext, useReducer } from 'react';

// 1. Define the state shape for each tab
interface HomeState {
  startDate?: Date;
  endDate?: Date;
}

interface SearchState {
  filters: any;
  searchResults: any[];
}

interface ReportState {
  selectedDate?: Date;
  selectedVendor: string;
  reportData: any;
}

interface RejectionTrendsState {
  fromDate?: Date;
  toDate?: Date;
  vendor: string;
  rejectionStage: 'both' | 'vqc' | 'ft';
  reportData: any;
}

interface ConfigurationState {
  googleSheetsConfig: any;
  postgresConfig: any;
}

// 2. Define the overall app state
interface AppState {
  home: HomeState;
  search: SearchState;
  report: ReportState;
  rejectionTrends: RejectionTrendsState;
  configuration: ConfigurationState;
}

// 3. Define actions
type Action = 
  | { type: 'SET_HOME_STATE'; payload: Partial<HomeState> }
  | { type: 'SET_SEARCH_STATE'; payload: Partial<SearchState> }
  | { type: 'SET_REPORT_STATE'; payload: Partial<ReportState> }
  | { type: 'SET_REJECTION_TRENDS_STATE'; payload: Partial<RejectionTrendsState> }
  | { type: 'SET_CONFIGURATION_STATE'; payload: Partial<ConfigurationState> };

// 4. Define the reducer
const initialState: AppState = {
  home: {
    startDate: new Date(),
    endDate: new Date(),
  },
  search: {
    filters: {
        serialNumbers: '',
        moNumbers: '',
        dateFrom: undefined,
        dateTo: undefined,
        vendor: [],
        vqcStatus: [],
        ftStatus: [],
        rejectionReason: [],
        pcb: [],
        qccode: [],
        qcperson: [],
    },
    searchResults: [],
  },
  report: {
    selectedDate: new Date(),
    selectedVendor: 'all',
    reportData: null,
  },
  rejectionTrends: {
    fromDate: new Date(),
    toDate: new Date(),
    vendor: 'all',
    rejectionStage: 'both',
    reportData: null,
  },
  configuration: {
    googleSheetsConfig: {
        serviceAccountJson: '',
        serviceAccountFile: null as File | null,
        serviceAccountPath: '',
        vendorDataUrl: '',
        vqcDataUrl: '',
        ftDataUrl: ''
    },
    postgresConfig: {
        host: 'localhost',
        port: '5432',
        database: 'rings_production',
        username: 'postgres',
        password: ''
    }
  }
};

const appStateReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_HOME_STATE':
      return { ...state, home: { ...state.home, ...action.payload } };
    case 'SET_SEARCH_STATE':
      return { ...state, search: { ...state.search, ...action.payload } };
    case 'SET_REPORT_STATE':
        return { ...state, report: { ...state.report, ...action.payload } };
    case 'SET_REJECTION_TRENDS_STATE':
        return { ...state, rejectionTrends: { ...state.rejectionTrends, ...action.payload } };
    case 'SET_CONFIGURATION_STATE':
        return { ...state, configuration: { ...state.configuration, ...action.payload } };
    default:
      return state;
  }
};

// 5. Create the context
const AppStateContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

// 6. Create a provider component
export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appStateReducer, initialState);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
};

// 7. Create a custom hook for easy access to the context
export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
