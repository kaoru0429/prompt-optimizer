export default {
  build(userMessage) {
    return {
      title: '通用任務提示詞',
      body: `請扮演一位專業助理，幫助我完成以下任務：\n\n${userMessage}\n\n請提供詳細、結構化的回應，並確保語氣專業且易於理解。`
    };
  }
};
