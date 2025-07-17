import mercadopago from 'mercadopago';

mercadopago.configure({
  access_token: process.env.MP_TOKEN
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { valencia, simbolo } = req.body;

  const valor = parseFloat(valencia);
  if (!simbolo || isNaN(valor) || valor < 1 || valor > 100) {
    return res.status(400).json({ erro: 'Valor ou token inválido' });
  }

  const pagamento = {
    transaction_amount: valor,
    description: `Comprar pontos para token ${simbolo}`,
    payment_method_id: 'pix',
    payer: {
      email: 'comprador@email.com'
    },
    metadata: {
      simbolo
    }
  };

  try {
    const resposta = await mercadopago.payment.create(pagamento);
    const { point_of_interaction } = resposta.body;

    return res.status(200).json({
      link: point_of_interaction.transaction_data.ticket_url,
      qr: point_of_interaction.transaction_data.qr_code_base64
    });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao criar pagamento' });
  }
}
