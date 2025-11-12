"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, ChevronRight, AlertCircle } from "lucide-react";
import { DataTable } from "@/components/dashboard/DataTable";
import { PermissionGate } from "@/components/PermissionGate";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { logger } from "@/lib/logger";

interface Entity {
  id: string;
  name: string;
  country: string;
  status: string;
  legalForm?: string;
  createdAt: string;
  registrations?: Array<{ type: string; status: string }>;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function EntitiesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Build query string
  const params = new URLSearchParams({
    ...(searchTerm && { search: searchTerm }),
    ...(countryFilter && { country: countryFilter }),
    ...(statusFilter && { status: statusFilter }),
  });

  // Fetch entities using SWR
  const {
    data: response,
    isLoading,
    error,
  } = useSWR<{ success: boolean; data: Entity[] }>(
    `/api/entities?${params}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  const entities = response?.data || [];

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const countryMap: Record<string, string> = {
    AE: "🇦🇪 United Arab Emirates",
    SA: "🇸🇦 Saudi Arabia",
    EG: "🇪🇬 Egypt",
  };

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    ARCHIVED: "bg-gray-100 text-gray-800",
    SUSPENDED: "bg-red-100 text-red-800",
  };

  const columns = [
    {
      id: "name",
      header: "Business Name",
      cell: (entity: Entity) => (
        <Link
          href={`/admin/entities/${entity.id}`}
          className="font-medium text-blue-600 hover:underline"
        >
          {entity.name}
        </Link>
      ),
    },
    {
      id: "country",
      header: "Country",
      cell: (entity: Entity) => (
        <span>{countryMap[entity.country] || entity.country}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (entity: Entity) => (
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            statusColors[entity.status] || "bg-gray-100 text-gray-800"
          }`}
        >
          {entity.status}
        </span>
      ),
    },
    {
      id: "legalForm",
      header: "Legal Form",
      cell: (entity: Entity) => <span>{entity.legalForm || "—"}</span>,
    },
    {
      id: "createdAt",
      header: "Created",
      cell: (entity: Entity) => (
        <span className="text-gray-600 text-sm">
          {new Date(entity.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (entity: Entity) => (
        <Link
          href={`/admin/entities/${entity.id}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          View
          <ChevronRight className="w-4 h-4" />
        </Link>
      ),
    },
  ];

  return (
    <PermissionGate
      permission="entity:read"
      fallback={
        <div className="p-6 text-center">
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
      }
    >
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Entities</h1>
            <p className="text-gray-600 mt-2">
              Manage business entities and tax registrations
            </p>
          </div>
          <PermissionGate permission="entity:create">
            <Link href="/admin/entities/new">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Entity
              </Button>
            </Link>
          </PermissionGate>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search entities by name..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="">All Countries</option>
            <option value="AE">United Arab Emirates</option>
            <option value="SA">Saudi Arabia</option>
            <option value="EG">Egypt</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="ARCHIVED">Archived</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load entities. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Data Table */}
        {!isLoading && entities.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <DataTable columns={columns} data={entities} />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && entities.length === 0 && !error && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600 text-lg">No entities found</p>
            <p className="text-gray-500 mt-2">
              {searchTerm || countryFilter || statusFilter
                ? "Try adjusting your filters"
                : "Create your first entity to get started"}
            </p>
            <PermissionGate permission="entity:create">
              <Link href="/admin/entities/new" className="mt-4 inline-block">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Entity
                </Button>
              </Link>
            </PermissionGate>
          </div>
        )}
      </div>
    </PermissionGate>
  );
}
