import api from "@/lib/axios";

export const createGasUsageApi = async (data: any) => {
	try {
		const response = await api.post("/gas-usages", data);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error creating gas usage record:", error.response?.data);
		return {
			success: false,
			error: error.response?.data?.message || "Failed to create gas usage record",
		};
	}
};

export const createMultipleGasUsagesApi = async (data: any) => {
	try {
		const response = await api.post("/gas-usages/multiple", data);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error creating gas usage records:", error.response?.data);
		return {
			success: false,
			error: error.response?.data?.message || "Failed to create gas usage records",
		};
	}
};

export const fetchBuildingGasUsagesApi = async (
	buildingId: string,
	starting: string,
	ending: string,
	status: string
) => {
	try {
		const response = await api.get(
			`/gas-usages/building/${buildingId}?starting=${starting}&ending=${ending}&status=${status}`
		);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error fetching building gas usage records:", error.response?.data);
		return {
			success: false,
			error: error.response?.data?.message || "Failed to fetch building gas usage records",
		};
	}
};

export const fetchFlatGasUsagesApi = async (
	flatId: string,
	starting: string,
	ending: string,
	status: string
) => {
	try {
		const response = await api.get(
			`/gas-usages/flat/${flatId}?starting=${starting}&ending=${ending}&status=${status}`
		);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error fetching flat gas usages:", error.response?.data);
		return {
			success: false,
			error: error.response?.data?.message || "Failed to fetch flat gas usages",
		};
	}
};

export const updateGasUsageApi = async (id: string, data: any) => {
	try {
		const response = await api.put(`/gas-usages/${id}`, data);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error updating gas usage record:", error.response?.data);
		return {
			success: false,
			error: error.response?.data?.message || "Failed to update gas usage record",
		};
	}
};

export const updateMultipleGasUsagesApi = async (id: string, data: any) => {
	try {
		const response = await api.put(`/gas-usages/multiple/${id}`, data);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error updating gas usage records:", error.response?.data);
		return {
			success: false,
			error: error.response?.data?.message || "Failed to update gas usage records",
		};
	}
};

export const deleteGasUsageApi = async (id: string) => {
	try {
		const response = await api.delete(`/gas-usages/${id}`);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error deleting gas usage record:", error.response?.data);
		return {
			success: false,
			error: error.response?.data?.message || "Failed to delete gas usage record",
		};
	}
};

export const fetchFlatBillRemainingApi = async (flatId: string) => {
	try {
		const response = await api.get(`/gas-usages/flat/remaining/${flatId}`);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error fetching bill remaining:", error.response?.data);
		return {
			success: false,
			error: error.response?.data?.message || "Failed to fetch bill remaining",
		};
	}
};

export const fetchBuildingBillRemainingApi = async (buildingId: string) => {
	try {
		const response = await api.get(`/gas-usages/building/remaining/${buildingId}`);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error fetching bill remaining:", error.response?.data);
		return {
			success: false,
			error: error.response?.data?.message || "Failed to fetch bill remaining",
		};
	}
};
