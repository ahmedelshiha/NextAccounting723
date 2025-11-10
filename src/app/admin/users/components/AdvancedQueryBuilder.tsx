'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Zap, Save, BookOpen } from 'lucide-react'
import {
  FilterCondition,
  FilterGroup,
  QueryTemplate,
  FIELD_METADATA,
  OPERATOR_METADATA,
  FilterField,
  FilterOperator,
  LogicalOperator
} from '../types/query-builder'
import { useQueryBuilder } from '../hooks/useQueryBuilder'

interface AdvancedQueryBuilderProps {
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onApplyQuery?: (query: FilterGroup | FilterCondition) => void
}

/**
 * AdvancedQueryBuilder Component
 * Provides a visual interface for building complex filter queries
 * Supports AND/OR logic, nested groups, and multiple operators
 */
export function AdvancedQueryBuilder({
  isOpen,
  onOpenChange,
  onApplyQuery
}: AdvancedQueryBuilderProps) {
  const [open, setOpen] = useState(isOpen ?? false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')

  const queryBuilder = useQueryBuilder()
  const { query, addCondition, removeCondition, updateCondition, saveAsTemplate, loadTemplate, deleteTemplate, templates, builtInTemplates, customTemplates } = queryBuilder

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  const handleApplyQuery = () => {
    onApplyQuery?.(query)
    handleOpenChange(false)
  }

  const handleSaveTemplate = () => {
    if (templateName.trim()) {
      saveAsTemplate(templateName, templateDescription)
      setTemplateName('')
      setTemplateDescription('')
      setShowTemplateDialog(false)
    }
  }

  const isGroup = 'conditions' in query

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Zap className="w-4 h-4" />
          Advanced Query
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Advanced Query Builder</DialogTitle>
          <DialogDescription>
            Build complex filter queries with AND/OR logic and multiple operators
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-6">
          {/* Left: Query Builder */}
          <div className="col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Filter Conditions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isGroup ? (
                  <QueryGroupRenderer
                    group={query as FilterGroup}
                    onAddCondition={addCondition}
                    onRemoveCondition={removeCondition}
                    onUpdateCondition={updateCondition}
                  />
                ) : (
                  <QueryConditionRenderer
                    condition={query as FilterCondition}
                    onRemove={() => removeCondition(query.id)}
                    onUpdate={(updates) => updateCondition(query.id, updates)}
                  />
                )}

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addCondition(isGroup ? (query as FilterGroup).id : query.id)}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Condition
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button onClick={handleApplyQuery} className="flex-1">
                Apply Query
              </Button>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
            </div>
          </div>

          {/* Right: Templates */}
          <div className="space-y-4">
            {/* Save as Template */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Save Query</CardTitle>
              </CardHeader>
              <CardContent>
                {showTemplateDialog ? (
                  <div className="space-y-3">
                    <Input
                      placeholder="Template name"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                    />
                    <Input
                      placeholder="Description (optional)"
                      value={templateDescription}
                      onChange={(e) => setTemplateDescription(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveTemplate} className="flex-1">
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowTemplateDialog(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowTemplateDialog(true)}
                    className="w-full gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save as Template
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Built-in Templates */}
            {builtInTemplates.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Built-in
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {builtInTemplates.map((template) => (
                        <Button
                          key={template.id}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => loadTemplate(template.id)}
                        >
                          {template.name}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Custom Templates */}
            {customTemplates.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">My Templates</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {customTemplates.map((template) => (
                        <div key={template.id} className="flex items-center justify-between gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 justify-start"
                            onClick={() => loadTemplate(template.id)}
                          >
                            {template.name}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTemplate(template.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Renders a single filter condition with field, operator, and value inputs
 */
interface QueryConditionRendererProps {
  condition: FilterCondition
  onRemove: () => void
  onUpdate: (updates: Partial<FilterCondition>) => void
}

function QueryConditionRenderer({
  condition,
  onRemove,
  onUpdate
}: QueryConditionRendererProps) {
  const fieldMeta = FIELD_METADATA[condition.field]
  const operatorMeta = OPERATOR_METADATA[condition.operator]

  return (
    <div className="flex items-end gap-2 p-3 bg-slate-50 rounded-lg border">
      <div className="flex-1 space-y-1">
        <label className="text-xs font-medium text-slate-600">Field</label>
        <Select value={condition.field} onValueChange={(value) => onUpdate({ field: value as FilterField })}>
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(FIELD_METADATA).map(([key, meta]) => (
              <SelectItem key={key} value={key}>
                {meta.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 space-y-1">
        <label className="text-xs font-medium text-slate-600">Operator</label>
        <Select value={condition.operator} onValueChange={(value) => onUpdate({ operator: value as FilterOperator })}>
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fieldMeta.operators.map((op) => {
              const opMeta = OPERATOR_METADATA[op]
              return (
                <SelectItem key={op} value={op}>
                  {opMeta.label}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      {operatorMeta.requiresValue !== false && (
        <div className="flex-1 space-y-1">
          <label className="text-xs font-medium text-slate-600">Value</label>
          <Input
            type="text"
            placeholder="Enter value"
            value={String(condition.value || '')}
            onChange={(e) => onUpdate({ value: e.target.value })}
            className="h-8"
          />
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )
}

/**
 * Renders a group of conditions with AND/OR toggle
 */
interface QueryGroupRendererProps {
  group: FilterGroup
  onAddCondition: (groupId: string) => void
  onRemoveCondition: (id: string) => void
  onUpdateCondition: (id: string, updates: Partial<FilterCondition>) => void
}

function QueryGroupRenderer({
  group,
  onAddCondition,
  onRemoveCondition,
  onUpdateCondition
}: QueryGroupRendererProps) {
  return (
    <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-dashed">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{group.operator}</Badge>
          <span className="text-xs text-slate-600">
            {group.conditions.length} condition{group.conditions.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {group.conditions.map((condition, index) => (
          <div key={condition.id}>
            {index > 0 && (
              <div className="text-xs font-semibold text-slate-600 py-2 text-center">
                {group.operator}
              </div>
            )}
            {('conditions' in condition) ? (
              <QueryGroupRenderer
                group={condition}
                onAddCondition={onAddCondition}
                onRemoveCondition={onRemoveCondition}
                onUpdateCondition={onUpdateCondition}
              />
            ) : (
              <QueryConditionRenderer
                condition={condition}
                onRemove={() => onRemoveCondition(condition.id)}
                onUpdate={(updates) => onUpdateCondition(condition.id, updates)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
