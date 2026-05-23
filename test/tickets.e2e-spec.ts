process.env.NODE_ENV = 'test';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';

const request = require('supertest');

const addMockUser = (req: any, res: any, next: any) => {
  req.user = { id: 1 }; 
  next(); 
};

describe('Tickets (e2e)', () => {
  jest.setTimeout(30000);
  let app: INestApplication;
  const mockToken = 'Bearer any-string-is-fine-because-middleware-overrides';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    if (!app) {
      throw new Error('Failed to create Nest application');
    }

    app.use(addMockUser); 
    await app.init();
   
    const projectRes = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', mockToken)
      .send({ 
        name: 'Test Project', 
        description: 'Testing description',
        ownerId: 1 
      });

    console.log('Project creation status:', projectRes.status);
  });

  it('POST /tickets - success', async () => {
    const projectRes = await request(app.getHttpServer())
      .get('/projects')
      .set('Authorization', mockToken);
    
    const projectId = projectRes.body[0].id;
    
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
    const projectRes = await request(app.getHttpServer()).get('/projects').set('Authorization', mockToken);
    const created = await request(app.getHttpServer())
      .post('/tickets')
      .set('Authorization', mockToken)
      .send({ title: 'To be deleted', description: 'Bye', projectId: projectRes.body[0].id });
    
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

  afterAll(async () => { 
    if (app) {
      await app.close(); 
    }
  });
});