
import mercadopago from 'mercadopago';

mercadopago.configure({
  access_token: process.env.MP_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Método não permitido');
  }

  const { valencia, simbolo } = req.body;
  const valor = parseFloat(valencia);

  if (!valor || valor < 1 || valor > 100 || !simbolo) {
    return res.status(400).send('Valor ou token inválido');
  }

  const pagamento = {
    transaction_amount: valor,
    description: `Compra de pontos - Token: ${simbolo}`,
    payment_method_id: 'pix',
    payer: {
      email: 'comprador@email.com',
    },
    metadata: { simbolo },
  };

  try {
    const resposta = await mercadopago.payment.create(pagamento);
    const ponto = resposta.body.point_of_interaction;

    return res.status(200).json({
      link: ponto.transaction_data.ticket_url,
      qr: ponto.transaction_data.qr_code_base64,
    });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao gerar pagamento' });
  }
}
