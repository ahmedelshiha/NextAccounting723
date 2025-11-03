'use client'
import React, { useEffect, useMemo, useState, useCallback } from 'react'
import TeamManagement from '@/components/admin/team-management'
import ListPage from '@/components/dashboard/templates/ListPage'
import { ClientFormModal } from '@/components/admin/shared/ClientFormModal'
import { TeamMemberFormModal } from '@/components/admin/shared/TeamMemberFormModal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, DollarSign, Edit3, Eye, Building, Users, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'
import type { Column } from '@/types/dashboard'
import { useListState } from '@/hooks/admin/useListState'
import { useListFilters } from '@/hooks/admin/useListFilters'
import { useFilterUsers } from '../../hooks/useFilterUsers'
import type { ClientItem } from '../../types/entities'

type EntitiesSubTab = 'clients' | 'team'

export function EntitiesTab() {
  const [activeSubTab, setActiveSubTab] = useState<EntitiesSubTab>('clients')
  const [clientFormModal, setClientFormModal] = useState({ isOpen: false, mode: 'create' as 'create' | 'edit', data: undefined as Partial<ClientItem> | undefined })
  const [teamFormModal, setTeamFormModal] = useState({ isOpen: false, mode: 'create' as 'create' | 'edit', data: undefined as any })

  // Initialize sub-tab from URL (?type=clients|team)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const t = params.get('type') as EntitiesSubTab | null
      if (t === 'clients' || t === 'team') setActiveSubTab(t)
    }
  }, [])

  const openClientForm = useCallback((data?: ClientItem) => {
    setClientFormModal({ isOpen: true, mode: data ? 'edit' : 'create', data })
  }, [])

  const closeClientForm = useCallback(() => {
    setClientFormModal({ isOpen: false, mode: 'create', data: undefined })
  }, [])

  const openTeamForm = useCallback((data?: any) => {
    setTeamFormModal({ isOpen: true, mode: data ? 'edit' : 'create', data })
  }, [])

  const closeTeamForm = useCallback(() => {
    setTeamFormModal({ isOpen: false, mode: 'create', data: undefined })
  }, [])

  return (
    <div className="min-h-[calc(100vh-100px)] bg-white">
      <div className="border-b border-gray-200">
        <nav className="flex gap-4 px-4 sm:px-6 lg:px-8" role="tablist">
          <button
            role="tab"
            aria-selected={activeSubTab === 'clients'}
            onClick={() => setActiveSubTab('clients')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeSubTab === 'clients' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            title="Manage clients"
          >
            <span className="mr-2">👤</span> Clients
          </button>
          <button
            role="tab"
            aria-selected={activeSubTab === 'team'}
            onClick={() => setActiveSubTab('team')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeSubTab === 'team' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            title="Manage team members"
          >
            <span className="mr-2">🏢</span> Team
          </button>
        </nav>
      </div>

      <div id="entities-panel" className="p-0">
        {activeSubTab === 'clients' ? (
          <>
            <ClientsListEmbedded onEdit={openClientForm} onAddClick={() => openClientForm()} />
            <ClientFormModal
              isOpen={clientFormModal.isOpen}
              onClose={closeClientForm}
              mode={clientFormModal.mode}
              initialData={clientFormModal.data}
              onSuccess={() => {
                closeClientForm()
                // Trigger refresh of clients list
                window.dispatchEvent(new Event('refresh-clients'))
              }}
            />
          </>
        ) : (
          <>
            <TeamManagementEmbedded onEdit={openTeamForm} onAddClick={() => openTeamForm()} />
            <TeamMemberFormModal
              isOpen={teamFormModal.isOpen}
              onClose={closeTeamForm}
              mode={teamFormModal.mode}
              initialData={teamFormModal.data}
              onSuccess={() => {
                closeTeamForm()
                // Trigger refresh of team list
                window.dispatchEvent(new Event('refresh-team'))
              }}
            />
          </>
        )}
      </div>
    </div>
  )
}

function ClientsListEmbedded({ onEdit, onAddClick }: { onEdit: (client: ClientItem) => void; onAddClick: () => void }) {
  const { rows, loading, error, setRows, setLoading, setError } = useListState<ClientItem>([])
  const { search, setSearch, values, setFilter } = useListFilters({ tier: 'all', status: 'all' })
  const tier = values.tier
  const status = values.status

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { ClientService } = await import('@/services/client.service')
      const svc = new ClientService()
      const items = await svc.list({ limit: 50, offset: 0 })
      setRows(items)
    } catch (e) {
      setError('Failed to load clients')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, setRows])

  useEffect(() => {
    load()
    const handleRefresh = () => load()
    window.addEventListener('refresh-clients', handleRefresh)
    return () => window.removeEventListener('refresh-clients', handleRefresh)
  }, [load])

  const filtered = useFilterUsers(rows, {
    search,
    tier: tier === 'all' ? undefined : tier,
    status: status === 'all' ? undefined : status
  }, {
    searchFields: ['name', 'email', 'company'],
    caseInsensitive: true,
    sortByDate: true
  })

  const handleDeleteClient = useCallback(async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return
    try {
      const response = await fetch(`/api/admin/entities/clients/${clientId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete client')
      toast.success('Client deleted successfully')
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete client')
    }
  }, [load])

  const columns: Column<ClientItem>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value, client) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-blue-700">{(client.name || client.email)?.[0]?.toUpperCase()}</span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{client.name || 'Unnamed Client'}</div>
            <div className="text-sm text-gray-500">{client.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'company',
      label: 'Company',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1">
          <Building className="w-4 h-4 text-gray-400" />
          <span>{value || '-'}</span>
        </div>
      )
    },
    {
      key: 'tier',
      label: 'Tier',
      sortable: true,
      render: (value) => {
        const tierColors: Record<string, string> = {
          INDIVIDUAL: 'bg-gray-100 text-gray-800',
          SMB: 'bg-blue-100 text-blue-800',
          ENTERPRISE: 'bg-purple-100 text-purple-800'
        }
        return (
          <Badge className={tierColors[String(value)] || 'bg-gray-100 text-gray-800'}>
            {value || 'Individual'}
          </Badge>
        )
      }
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => {
        const statusColors: Record<string, string> = {
          ACTIVE: 'bg-green-100 text-green-800',
          INACTIVE: 'bg-gray-100 text-gray-800',
          SUSPENDED: 'bg-red-100 text-red-800'
        }
        return (
          <Badge className={statusColors[String(value)] || 'bg-green-100 text-green-800'}>
            {value || 'Active'}
          </Badge>
        )
      }
    },
    {
      key: 'totalBookings',
      label: 'Bookings',
      sortable: true,
      align: 'center',
      render: (value) => (
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{value || 0}</span>
        </div>
      )
    },
    {
      key: 'totalRevenue',
      label: 'Revenue',
      sortable: true,
      align: 'right',
      render: (value) => (
        <div className="flex items-center justify-end gap-1">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span>${Number(value || 0).toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'lastBooking',
      label: 'Last Booking',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{value ? new Date(value).toLocaleDateString() : 'Never'}</span>
        </div>
      )
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_, client) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(client)}>
            <Edit3 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDeleteClient(client.id)}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      )
    }
  ]

  const filterConfigs = [
    {
      key: 'tier',
      label: 'Client Tier',
      options: [
        { value: 'all', label: 'All Tiers' },
        { value: 'individual', label: 'Individual' },
        { value: 'smb', label: 'SMB' },
        { value: 'enterprise', label: 'Enterprise' }
      ],
      value: tier
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'suspended', label: 'Suspended' }
      ],
      value: status
    }
  ]

  const onFilterChange = (key: string, value: string) => {
    setFilter(key, value)
  }

  return (
    <div className="p-0">
      <ListPage
        title="Client Management"
        subtitle="Manage your client relationships and data"
        primaryAction={{ label: 'Add Client', onClick: onAddClick, icon: Users }}
        secondaryActions={[]}
        onSearch={setSearch}
        searchPlaceholder="Search clients..."
        filters={filterConfigs}
        onFilterChange={onFilterChange}
        columns={columns}
        rows={filtered}
        loading={loading}
      />
    </div>
  )
}

function TeamManagementEmbedded({ onEdit, onAddClick }: { onEdit: (member: any) => void; onAddClick: () => void }) {
  return (
    <div>
      <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
          <p className="text-sm text-gray-500 mt-1">Manage your team members and their assignments</p>
        </div>
        <Button onClick={onAddClick} variant="default">
          Add Member
        </Button>
      </div>
      <TeamManagement hideHeader />
    </div>
  )
}
