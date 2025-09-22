import api from "@/lib/axios";
import type { CreateContributionData } from "@/pages/ManageMosqueContributionsPage";

export const createContributionApi = async (data: CreateContributionData) => {
	try {
		const response = await api.post("contributions/", data);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error creating contribution:", error.response?.data);
		return {
			success: false,
			error: error.response?.data?.message || "Failed to create contribution",
		};
	}
};

export const createMultipleContributionsApi = async (data: any) => {
	try {
		const response = await api.post("contributions/multiple", data);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error creating contributions:", error.response?.data);
		return {
			success: false,
			error: error.response?.data?.message || "Failed to create contributions",
		};
	}
};

export const fetchBuildingContributionsApi = async (
	buildingId: string,
	starting: string,
	ending: string
) => {
	try {
		const response = await api.get(
			`/contributions/building/${buildingId}?starting=${starting}&ending=${ending}`
		);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error fetching contributions:", error.response?.data);
		return {
			success: false,
			error: error.response?.data?.message || "Failed to fetch contributions",
		};
	}
};

export const fetchFlatContributionsApi = async (
	flatId: string,
	starting: string,
	ending: string
) => {
	try {
		const response = await api.get(
			`/contributions/flat/${flatId}?starting=${starting}&ending=${ending}`
		);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error fetching current contributions:", error.response?.data);
		return {
			success: false,
			error: error.response?.data?.message || "Failed to fetch contributions",
		};
	}
};

export const updateContributionApi = async (id: string, data: Partial<CreateContributionData>) => {
	try {
		const response = await api.put(`contributions/${id}`, data);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error updating contribution:", error.response?.data);
		return {
			success: false,
			error: error.response?.data?.message || "Failed to update contribution",
		};
	}
};

export const deleteContributionApi = async (id: string) => {
	try {
		const response = await api.delete(`contributions/${id}`);
		return { success: true, data: response.data };
	} catch (error: any) {
		console.error("Error deleting contribution:", error.response?.data);
		return {
			success: false,
			error: error.response?.data?.message || "Failed to delete contribution",
		};
	}
};
