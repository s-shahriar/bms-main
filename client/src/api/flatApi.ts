import api from "@/lib/axios";
import type { EditFlatData } from "@/pages/ManageFlatsPage";

export const fetchBuildingFlatsApi = async (buildingId: string) => {
	try {
		const response = await api.get(`/flats/building/${buildingId}`);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error fetching flats:", error.response?.data);
		return { success: false, error: error.response?.data?.message || "Failed to fetch flats" };
	}
};

export const updateFlatApi = async (flatId: string, data: Partial<EditFlatData>) => {
	try {
		const response = await api.put(`/flats/${flatId}`, data);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error updating flat:", error.response?.data);
		return { success: false, error: error.response?.data?.message || "Failed to update flat" };
	}
};
