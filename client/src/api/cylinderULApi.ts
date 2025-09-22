import api from "@/lib/axios";

export const fetchBuildingCylinderULsApi = async (
	buildingId: string,
	starting: string,
	ending: string
) => {
	try {
		const response = await api.get(
			`/cylinder-uls/building/${buildingId}?starting=${starting}&ending=${ending}`
		);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error fetching cylinder purchase logs:", error.response?.data);
		return {
			success: false,
			error: error.response?.data?.message || "Failed to fetch cylinder purchase logs",
		};
	}
};

export const createCylinderULApi = async (data: any) => {
	try {
		const response = await api.post("/cylinder-uls", data);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error creating cylinder purchase log:", error.response?.data);
		return {
			success: false,
			error: error.response?.data?.message || "Failed to create cylinder purchase log",
		};
	}
};

export const updateCylinderULApi = async (id: string, data: Partial<any>) => {
	try {
		const response = await api.put(`/cylinder-uls/${id}`, data);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error updating cylinder purchase log:", error.response?.data);
		return {
			success: false,
			error: error.response?.data?.message || "Failed to update cylinder purchase log",
		};
	}
};

export const deleteCylinderULApi = async (id: string) => {
	try {
		const response = await api.delete(`/cylinder-uls/${id}`);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error deleting cylinder purchase log:", error.response?.data);
		return {
			success: false,
			error: error.response?.data?.message || "Failed to delete cylinder purchase log",
		};
	}
};
