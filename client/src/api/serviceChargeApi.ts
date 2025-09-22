import api from "@/lib/axios";
import type { CreateServiceChargeData } from "@/pages/ManageServiceChargesPage";

export const createServiceChargeApi = async (data: CreateServiceChargeData) => {
	try {
		const response = await api.post("service-charges/", data);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error creating service charge:", error.response?.data);
		return {
			success: false,
			error: error.response?.data?.message || "Failed to create service charge",
		};
	}
};

export const createMultipleServiceChargesApi = async (data: any) => {
	try {
		const response = await api.post("service-charges/multiple", data);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error creating service charges:", error.response?.data);
		return {
			success: false,
			error: error.response?.data?.message || "Failed to create service charges",
		};
	}
};

export const fetchBuildingServiceChargesApi = async (
	buildingId: string,
	starting: string,
	ending: string
) => {
	try {
		const response = await api.get(
			`/service-charges/building/${buildingId}?starting=${starting}&ending=${ending}`
		);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error fetching service charges:", error.response?.data);
		return {
			success: false,
			error: error.response?.data?.message || "Failed to fetch service charges",
		};
	}
};

export const fetchFlatServiceChargesApi = async (
	flatId: string,
	starting: string,
	ending: string
) => {
	try {
		const response = await api.get(
			`/service-charges/flat/${flatId}?starting=${starting}&ending=${ending}`
		);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error fetching current service charges:", error.response?.data);
		return {
			success: false,
			error: error.response?.data?.message || "Failed to fetch service charges",
		};
	}
};

export const updateServiceChargeApi = async (
	id: string,
	data: Partial<CreateServiceChargeData>
) => {
	try {
		const response = await api.put(`service-charges/${id}`, data);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error updating service charge:", error.response?.data);
		return {
			success: false,
			error: error.response?.data?.message || "Failed to update service charge",
		};
	}
};

export const deleteServiceChargeApi = async (id: string) => {
	try {
		const response = await api.delete(`service-charges/${id}`);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error deleting service charge:", error.response?.data);
		return {
			success: false,
			error: error.response?.data?.message || "Failed to delete service charge",
		};
	}
};
