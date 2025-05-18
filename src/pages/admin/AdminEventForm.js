import React, { useState, useEffect } from 'react';
import API from '../../api';
import { Form, Container, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const AdminEventForm = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({
    name: '', description: '', category: '',
    date: '', venue: '', price: '', image: '', tags: ''
  });
  const [loading, setLoading] = useState(isEdit);
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    if (!isEdit) return;
    API.get(`/events/${id}`)
      .then(res => setForm({
        ...res.data,
        date: res.data.date.slice(0, 16),
        tags: Array.isArray(res.data.tags) ? res.data.tags.join(', ') : res.data.tags || '',
        image: res.data.image && res.data.image._id
          ? `${API_BASE_URL}/api/upload/image/${res.data.image._id}`
          : ''
      }))
      .catch(() => toast.error(t('Failed to load event')))
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [id, isEdit]);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    let submitForm = { ...form };
    if (typeof submitForm.tags === 'string') {
      submitForm.tags = submitForm.tags
        .split(',')
        .map(tg => tg.trim())
        .filter(Boolean);
    }
    // If image is a full URL, extract the imageId from the URL
    if (submitForm.image && submitForm.image.startsWith(API_BASE_URL)) {
      const match = submitForm.image.match(/\/api\/upload\/image\/([a-f\d]{24})/);
      if (match) submitForm.image = match[1];
    }
    try {
      if (isEdit) {
        await API.put(`/events/${id}`, submitForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(t('Event updated'));
      } else {
        await API.post('/events', submitForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(t('Event created'));
      }
      navigate('/admin/events');
    } catch (err) {
      toast.error(err.response?.data?.msg || t('Save failed'));
    }
  };

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await API.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      // Set image as the API URL for preview, but store only the imageId on submit
      setForm(f => ({
        ...f,
        image: `${API_BASE_URL}/api/upload/image/${res.data.imageId}`
      }));
      toast.success(t('Image uploaded'));
    } catch (err) {
      toast.error(t('Image upload failed'));
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    multiple: false,
    onDrop
  });

  if (loading) return <Spinner animation="border" />;

  if (!token || localStorage.getItem('userRole') !== 'admin') {
    return <Alert variant="danger">{t('Access denied')}</Alert>;
  }

  return (
    <Container style={{ maxWidth: 600, marginTop: '2rem' }}>
      <h2>{isEdit ? t('Edit Event') : t('Create New Event')}</h2>
      <Form onSubmit={handleSubmit}>
        {['name', 'category', 'venue'].map(field => (
          <Form.Group className="mb-3" key={field}>
            <Form.Label>{t(field.charAt(0).toUpperCase() + field.slice(1))}</Form.Label>
            <Form.Control
              name={field}
              value={form[field]}
              onChange={handleChange}
              required
            />
          </Form.Group>
        ))}
        <Form.Group className="mb-3">
          <Form.Label>{t('Description')}</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="description"
            value={form.description}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>{t('Date & Time')}</Form.Label>
          <Form.Control
            type="datetime-local"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>{t('Price')}</Form.Label>
          <Form.Control
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{t('Tags (comma separated)')}</Form.Label>
          <Form.Control
            name="tags"
            value={Array.isArray(form.tags) ? form.tags.join(', ') : form.tags || ''}
            onChange={e =>
              setForm(f => ({
                ...f,
                tags: e.target.value
              }))
            }
            placeholder={t('e.g. music, live, outdoor')}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{t('Event Image')}</Form.Label>
          <div
            {...getRootProps({
              className: 'dropzone border p-3 text-center',
              style: {
                cursor: 'pointer',
                border: '2px dashed #ccc',
                borderRadius: '10px',
                background: '#fafafa'
              }
            })}
          >
            <input {...getInputProps()} />
            {form.image ? (
              <img src={form.image} alt="Uploaded" style={{ maxWidth: '100%', maxHeight: 200 }} />
            ) : (
              <p>{t('Drag & drop an image here, or click to select')}</p>
            )}
          </div>
        </Form.Group>

        <Button type="submit">
          {isEdit ? t('Update Event') : t('Create Event')}
        </Button>
      </Form>
    </Container>
  );
};

export default AdminEventForm;