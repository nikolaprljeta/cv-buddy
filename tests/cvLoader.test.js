const { fetchCvData } = require('../js/cvLoader.js');

describe('cvLoader', () => {
  const originalFetch = global.fetch;

  it('should fetch and parse CV data successfully', async () => {
    const mockData = { name: 'Test Person' };
    global.fetch = async (url) => {
      assertEquals(url, '../data/cvData_en.json');
      return {
        ok: true,
        json: async () => mockData,
      };
    };

    const data = await fetchCvData('en');
    assertEquals(data, mockData);
    global.fetch = originalFetch; // Restore
  });

  it('should return null if the fetch response is not ok', async () => {
    global.fetch = async (url) => {
      return {
        ok: false,
      };
    };

    const data = await fetchCvData('en');
    assertEquals(data, null);
    global.fetch = originalFetch; // Restore
  });

  it('should return null if fetch throws an error', async () => {
    global.fetch = async (url) => {
      throw new Error('Network error');
    };

    const data = await fetchCvData('en');
    assertEquals(data, null);
    global.fetch = originalFetch; // Restore
  });
});
