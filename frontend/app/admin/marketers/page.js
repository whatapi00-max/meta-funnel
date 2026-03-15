'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { adminApi } from '../../../lib/api';

export default function AdminMarketers() {
  const [marketers, setMarketers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    email: '', password: '', name: '', ref_code: '', whatsapp_number: '', whatsapp_number_2: '',
  });
  const [editForm, setEditForm] = useState({ name: '', whatsapp_number: '', whatsapp_number_2: '', status: '' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  async function loadMarketers() {
    try {
      const data = await adminApi.getMarketers();
      setMarketers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadMarketers(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      await adminApi.createMarketer(form);
      setShowCreate(false);
      setForm({ email: '', password: '', name: '', ref_code: '', whatsapp_number: '', whatsapp_number_2: '' });
      await loadMarketers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  }

  async function handleUpdate(id) {
    setFormError('');
    setFormLoading(true);
    try {
      await adminApi.updateMarketer(id, editForm);
      setEditingId(null);
      await loadMarketers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Delete marketer "${name}"? This will also delete all their click data.`)) return;
    try {
      await adminApi.deleteMarketer(id);
      await loadMarketers();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(marketer) {
    setEditingId(marketer.id);
    setEditForm({
      name: marketer.name,
      whatsapp_number: marketer.whatsapp_number,
      whatsapp_number_2: marketer.whatsapp_number_2 || '',
      status: marketer.status,
    });
    setFormError('');
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Marketers</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary text-sm">
          {showCreate ? 'Cancel' : '+ Add Marketer'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">{error}</div>
      )}

      {/* Create Form */}
      {showCreate && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Create New Marketer</h2>
          <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-4">
            {formError && (
              <div className="sm:col-span-2 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {formError}
              </div>
            )}
            <input
              type="text" placeholder="Full Name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field" required
            />
            <input
              type="email" placeholder="Email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field" required
            />
            <input
              type="password" placeholder="Password (min 8 chars)" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input-field" minLength={8} required
            />
            <input
              type="text" placeholder="Ref Code (e.g. john)" value={form.ref_code}
              onChange={(e) => setForm({ ...form, ref_code: e.target.value })}
              className="input-field" pattern="^[a-zA-Z0-9_-]{3,30}$" required
            />
            <input
              type="text" placeholder="WhatsApp 1 (e.g. 919876543210)" value={form.whatsapp_number}
              onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
              className="input-field" pattern="^\d{10,15}$" required
            />
            <input
              type="text" placeholder="WhatsApp 2 (optional)" value={form.whatsapp_number_2}
              onChange={(e) => setForm({ ...form, whatsapp_number_2: e.target.value })}
              className="input-field" pattern="^\d{0,15}$"
            />
            <button type="submit" disabled={formLoading} className="btn-primary">
              {formLoading ? 'Creating...' : 'Create Marketer'}
            </button>
          </form>
        </div>
      )}

      {/* Marketers Table */}
      <div className="card overflow-x-auto">
        {marketers.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No marketers yet. Create one above.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Name</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium hidden sm:table-cell">Email</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Ref Code</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium hidden md:table-cell">WhatsApp 1</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium hidden lg:table-cell">WhatsApp 2</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {marketers.map((m) => (
                <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50">
                  {editingId === m.id ? (
                    <>
                      <td className="py-3 px-4">
                        <input
                          type="text" value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="input-field text-sm py-2"
                        />
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell text-gray-400">{m.users?.email}</td>
                      <td className="py-3 px-4 text-gray-500">{m.ref_code}</td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <input
                          type="text" value={editForm.whatsapp_number}
                          onChange={(e) => setEditForm({ ...editForm, whatsapp_number: e.target.value })}
                          className="input-field text-sm py-2"
                        />
                      </td>
                      <td className="py-3 px-4 hidden lg:table-cell">
                        <input
                          type="text" value={editForm.whatsapp_number_2}
                          onChange={(e) => setEditForm({ ...editForm, whatsapp_number_2: e.target.value })}
                          className="input-field text-sm py-2"
                          placeholder="Optional"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={editForm.status}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                          className="input-field text-sm py-2"
                        >
                          <option value="active">Active</option>
                          <option value="pending">Pending</option>
                          <option value="disabled">Disabled</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleUpdate(m.id)}
                          disabled={formLoading}
                          className="text-brand-600 hover:text-brand-700 font-medium text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-gray-400 hover:text-gray-600 text-sm"
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-4 font-medium text-gray-900">{m.name}</td>
                      <td className="py-3 px-4 hidden sm:table-cell text-gray-500">{m.users?.email}</td>
                      <td className="py-3 px-4 text-gray-500">{m.ref_code}</td>
                      <td className="py-3 px-4 hidden md:table-cell text-gray-500">{m.whatsapp_number}</td>
                      <td className="py-3 px-4 hidden lg:table-cell text-gray-500">{m.whatsapp_number_2 || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          m.status === 'active' ? 'bg-green-100 text-green-700' :
                          m.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => startEdit(m)}
                          className="text-brand-600 hover:text-brand-700 font-medium text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(m.id, m.name)}
                          className="text-red-500 hover:text-red-700 font-medium text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
