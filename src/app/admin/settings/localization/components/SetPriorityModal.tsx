'use client'

import React, { useState, useEffect } from 'react'
import { useTranslationPriority } from '../hooks/useTranslationPriority'
import { X } from 'lucide-react'

type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
type PriorityStatus = 'OPEN' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE'

interface PriorityForm {
  key: string
  languageCode: string
  priority: Priority
  status: PriorityStatus
  dueDate: string
  assignedToUserId: string
  notes: string
}

export const SetPriorityModal: React.FC<{ item?: any | null; onClose: () => void }> = ({ item = null, onClose }) => {
  const isEdit = Boolean(item)
  const [form, setForm] = useState<PriorityForm>({ key: '', languageCode: '', priority: 'MEDIUM', status: 'OPEN', dueDate: '', assignedToUserId: '', notes: '' })
  const { createOrUpdate } = useTranslationPriority()

  useEffect(() => {
    if (item) {
      setForm({
        key: item.key || '',
        languageCode: item.languageCode || '',
        priority: (item.priority as Priority) || 'MEDIUM',
        status: (item.status as PriorityStatus) || 'OPEN',
        dueDate: item.dueDate ? new Date(item.dueDate).toISOString().slice(0, 10) : '',
        assignedToUserId: item.assignedToUserId || '',
        notes: item.notes || '',
      })
    }
  }, [item])

  async function handleSave() {
    if (!form.key || form.key.trim() === '') return
    await createOrUpdate({ ...form })
    onClose()
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement & { name?: string }
    const name = target.name || ''
    const value = target.value
    if (!name) return
    setForm(s => ({ ...s, [name]: value } as PriorityForm))
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{isEdit ? 'Edit Priority' : 'Set Priority'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Key</label>
            <input name="key" value={form.key} onChange={onInputChange} className="w-full px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="text-sm font-medium">Language Code (optional)</label>
            <input name="languageCode" value={form.languageCode} onChange={onInputChange} className="w-full px-3 py-2 border rounded" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Priority</label>
              <select name="priority" value={form.priority} onChange={onInputChange} className="w-full px-3 py-2 border rounded">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <select name="status" value={form.status} onChange={onInputChange} className="w-full px-3 py-2 border rounded">
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="BLOCKED">Blocked</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Due Date</label>
            <input type="date" name="dueDate" value={form.dueDate} onChange={onInputChange} className="w-full px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="text-sm font-medium">Assigned To (user id)</label>
            <input name="assignedToUserId" value={form.assignedToUserId} onChange={onInputChange} className="w-full px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="text-sm font-medium">Notes</label>
            <textarea name="notes" value={form.notes} onChange={onInputChange} className="w-full px-3 py-2 border rounded" rows={4} />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 rounded bg-blue-600 text-white">{isEdit ? 'Update' : 'Create'}</button>
        </div>
      </div>
    </div>
  )
}
