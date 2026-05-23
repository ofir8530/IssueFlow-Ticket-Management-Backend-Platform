process.env.NODE_ENV = 'test';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';

const request = require('supertest');

const addMockUser = (req: any, res: any, next: any) => {
  req.user = { id: 'some-user-id' }; 
  next();
};

describe('Tickets (e2e)', () => {
  let app: INestApplication;
  const mockToken = 'Bearer valid-token-for-testing';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(addMockUser); 
    await app.init();
    await request(app.getHttpServer())
      .post('/projects') 
      .set('Authorization', mockToken)
      .send({ 
        name: 'Test Project', 
        description: 'Testing description',
        ownerId: 1 
      });
  });

  it('POST /tickets - success', async () => {
    const projectRes = await request(app.getHttpServer())
      .get('/projects'); 
    
    const projectId = projectRes.body[0]?.id || 1; 
    const response = await request(app.getHttpServer())
      .post('/tickets')
      .set('Authorization', mockToken)
      .send({ 
        title: 'New Bug', 
        description: 'Fix it',
        projectId: projectId 
      });
    expect(response.status).toBe(201);
  });

  it('GET /tickets - should list tickets', async () => {
    const response = await request(app.getHttpServer())
      .get('/tickets')
      .set('Authorization', mockToken);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('DELETE /tickets/:id - soft delete', async () => {
    const created = await request(app.getHttpServer())
      .post('/tickets')
      .set('Authorization', mockToken)
      .send({ title: 'To be deleted', description: 'Bye', projectId: 'some-project-id' });
    
    const id = created.body.id;
    
    await request(app.getHttpServer())
      .delete(`/tickets/${id}`)
      .set('Authorization', mockToken);
    
    const list = await request(app.getHttpServer())
      .get('/tickets')
      .set('Authorization', mockToken);
    
    const exists = list.body.find((t: any) => t.id === id);
    expect(exists).toBeUndefined();
  });

  afterAll(async () => { await app.close(); });
});