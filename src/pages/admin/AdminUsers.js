import React, { useEffect, useState } from 'react';
import API from '../../api';
import { Table, Button, Container, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const AdminUsers = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get('/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data);
      } catch {
        toast.error(t('Failed to load users'));
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
    // eslint-disable-next-line
  }, [token]);

  const handlePromote = async (userId) => {
    try {
      await API.patch(
        `/auth/promote/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(t('User promoted to admin'));
      setUsers(us =>
        us.map(u => (u._id === userId ? { ...u, role: 'admin' } : u))
      );
    } catch {
      toast.error(t('Promotion failed'));
    }
  };

  if (loading) return <Spinner animation="border" />;
  if (!token || localStorage.getItem('userRole') !== 'admin') {
    return <Alert variant="danger">{t('Access denied')}</Alert>;
  }

  return (
    <Container className="mt-4">
      <h2>{t('Admin: Manage Users')}</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>{t('Name')}</th>
            <th>{t('Email')}</th>
            <th>{t('Role')}</th>
            <th>{t('Actions')}</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{t(u.role)}</td>
              <td>
                {u.role !== 'admin' && (
                  <Button
                    size="sm"
                    onClick={() => handlePromote(u._id)}
                  >
                    {t('Promote')}
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default AdminUsers;