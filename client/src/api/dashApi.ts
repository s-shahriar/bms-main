import api from "@/lib/axios";

export const fetchMonthlyBuildingSummaryApi = async (buildingId: string) => {
	try {
		const response = await api.get(`/dash/monthly-building-summary/${buildingId}`);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error fetching summary:", error.response?.data);
		return {
			success: false,
			error: error.response?.data?.message || "Failed to fetch summary",
		};
	}
};

export const fetchYearlyBuildingChartDataApi = async (buildingId: string) => {
	try {
		const response = await api.get(`/dash/yearly-building-chart-data/${buildingId}`);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error fetching chart data:", error.response?.data);
		return {
			success: false,
			error: error.response?.data?.message || "Failed to fetch chart data",
		};
	}
};

export const fetchMonthlyFlatSummaryApi = async (flatId: string) => {
	try {
		const response = await api.get(`/dash/monthly-flat-summary/${flatId}`);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error fetching summary:", error.response?.data);
		return {
			success: false,
			error: error.response?.data?.message || "Failed to fetch summary",
		};
	}
};

export const fetchYearlyFlatChartDataApi = async (flatId: string) => {
	try {
		const response = await api.get(`/dash/yearly-flat-chart-data/${flatId}`);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error fetching chart data:", error.response?.data);
		return {
			success: false,
			error: error.response?.data?.message || "Failed to fetch chart data",
		};
	}
};
