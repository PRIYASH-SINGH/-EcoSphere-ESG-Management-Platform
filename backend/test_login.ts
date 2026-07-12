import { AuthService } from './src/services/auth.service';

const service = new AuthService();

async function test() {
  try {
    const result = await service.login('admin@ecosphere.com', 'admin123');
    console.log('Success:', result);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
