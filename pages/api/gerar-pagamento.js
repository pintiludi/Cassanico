import mercadopago from 'mercadopago';

mercadopago.configure({
  access_token: process.env.MP_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).send('Método não permitido');
  }

  const valor = parseFloat(req.query.valentia);
  const simbolo = req.query.simbolo;

  if (!valor || valor < 1 || valor > 100 || !simbolo) {
    return res.status(400).send('Valor ou token inválido');
  }

  const pagamento = {
    transaction_amount: valor,
    description: `Comprar pontos para tokens (${simbolo})`,
    payment_method_id: 'pix',
    payer: {
      email: 'comprador@email.com',
    },
    metadata: { simbolo },
  };

  try {
    const resposta = await mercadopago.payment.create(pagamento);
    const { point_of_interaction } = resposta.body;

    res.status(200).json({
      link: point_of_interaction.transaction_data.ticket_url,
      qr: point_of_interaction.transaction_data.qr_code_base64,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao criar pagamento');
  }
}
