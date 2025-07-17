import mercadopago from 'mercadopago';

mercadopago.configure({
  access_token: process.env.MP_TOKEN
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).send("Método não permitido");
  }

  const valor = parseFloat(req.query.valor);
  const token = req.query.token;

  if (valor < 1 || valor > 100 || !token) {
    return res.status(400).send("Valor ou token inválido");
  }

  const pagamento = {
    transaction_amount
