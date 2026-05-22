import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app';
import { prisma } from '../lib/prisma';

describe('Printer API', () => {
  beforeAll(async () => {
    // Clean up database before tests
    await prisma.printer.deleteMany();
  });

  afterAll(async () => {
    // Disconnect Prisma after tests
    await prisma.$disconnect();
  });

  it('should create a printer', async () => {
    const printerData = {
      name: 'Test Printer',
      model: 'Test Model',
      status: 'IDLE',
      ipAddress: '192.168.1.1',
      nozzleDiameter: 0.4,
      bedTemp: 60,
      nozzleTemp: 200,
      cameraLink: 'http://example.com',
      printerType: 'FDM',
    };

    const response = await request(app)
      .post('/api/printers')
      .send(printerData)
      .expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(printerData.name);
  });

  it('should get all printers', async () => {
    const response = await request(app)
      .get('/api/printers')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should get a printer by id', async () => {
    // First create a printer
    const printerData = {
      name: 'Test Printer 2',
      model: 'Test Model 2',
      status: 'IDLE',
      ipAddress: '192.168.1.2',
      nozzleDiameter: 0.4,
      bedTemp: 60,
      nozzleTemp: 200,
      cameraLink: 'http://example.com',
      printerType: 'FDM',
    };

    const createResponse = await request(app)
      .post('/api/printers')
      .send(printerData);

    const printerId = createResponse.body.id;

    const response = await request(app)
      .get(`/api/printers/${printerId}`)
      .expect(200);

    expect(response.body.id).toBe(printerId);
    expect(response.body.name).toBe(printerData.name);
  });
});