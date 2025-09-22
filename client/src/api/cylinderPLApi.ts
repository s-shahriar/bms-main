import api from "@/lib/axios";
import type { CreateCylinderPLData } from "@/pages/ManageCylinderPLsPage";

export const fetchBuildingCylinderPLsApi = async (
	buildingId: string,
	starting: string,
	ending: string
) => {
	try {
		const response = await api.get(
			`/cylinder-pls/building/${buildingId}?starting=${starting}&ending=${ending}`
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

export const createCylinderPLApi = async (data: CreateCylinderPLData) => {
	try {
		const response = await api.post("/cylinder-pls", data);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error creating cylinder purchase log:", error.response?.data);
		return {
			success: false,
			error: error.response?.data?.message || "Failed to create cylinder purchase log",
		};
	}
};

export const updateCylinderPLApi = async (id: string, data: Partial<CreateCylinderPLData>) => {
	try {
		const response = await api.put(`/cylinder-pls/${id}`, data);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error updating cylinder purchase log:", error.response?.data);
		return {
			success: false,
			error: error.response?.data?.message || "Failed to update cylinder purchase log",
		};
	}
};

export const deleteCylinderPLApi = async (id: string) => {
	try {
		const response = await api.delete(`/cylinder-pls/${id}`);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error deleting cylinder purchase log:", error.response?.data);
		return {
			success: false,
			error: error.response?.data?.message || "Failed to delete cylinder purchase log",
		};
	}
};
