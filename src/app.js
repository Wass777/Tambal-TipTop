document.addEventListener("alpine:init", () => {
  Alpine.data("products", () => ({
    items: [
      { id: 1, name: "Ban Mobil", img: "ban1.jpg", price: 250000 },
      { id: 2, name: "Ban Motor", img: "ban2.jpg", price: 120000 },
      { id: 3, name: "Tambal Mobil", img: "tmbl_Mobil.jpg", price: 70000 },
      { id: 4, name: "Tambal Motor", img: "tmbl_Motor.jpg", price: 70000 },
    ],
  }));

  Alpine.store("cart", {
    items: [],
    total: 0,
    quantity: 0,
    add(newItem) {
      // mengecek apakah ada barang yanng sama
      const cartItem = this.items.find((items) => items.id === newItem.id);

      // jika belum ada

      if (!cartItem) {
        this.items.push({ ...newItem, quantity: 1, total: newItem.price });
        this.quantity++;
        this.total += newItem.price;
      } else {
        // jika barang sudah ada, mengecek apakah sama /beda
        this.items = this.items.map((items) => {
          // jika barang beda
          if (items.id !== newItem.id) {
            return items;
          } else {
            // jiika sudah ada barang tambah jumlah dan quantity
            items.quantity++;
            items.total = items.price * items.quantity;
            this.quantity++;
            this.total += items.price;
            return items;
          }
        });
      }
    },
    remove(id) {
      // ambil item ygg mau di remove berdasarkan id
      const cartItem = this.items.find((items) => items.id === id);
      //  jika item lebih dari 1
      if (cartItem.quantity > 1) {
        // cari 1 1
        this.items = this.items.map((items) => {
          // jiika bukan barang yg di klk
          if (items.id !== id) {
            return items;
          } else {
            items.quantity--;
            items.total = items.price * items.quantity;
            this.quantity--;
            this.total -= items.price;
            return items;
          }
        });
      } else if (cartItem.quantity === 1) {
        // jika barang sisa 1
        this.items = this.items.filter((items) => items.id !== id);
        this.quantity--;
        this.total -= cartItem.price;
      }
    },
  });
});

// form validation
const checkoutButton = document.querySelector(".checkout-button");
checkoutButton.disabled = true;

const form = document.querySelector("#checkoutForm");

form.addEventListener("keyup", function () {
  for (let i = 0; i < form.elements.length; i++) {
    if (form.elements[i].value.length !== 0) {
      checkoutButton.classList.remove("disabled");
      checkoutButton.classList.add("disabled");
    } else {
      return false;
    }
  }
  checkoutButton.disabled = false;
  checkoutButton.classList.remove("disabled");
});

// kirim data ketika tombol checkuot di klik
checkoutButton.addEventListener("click", async function (e) {
  e.preventDefault();
  const formData = new FormData(form);
  const data = new URLSearchParams(formData);
  const objData = Object.fromEntries(data);

  // minta trensaksi token menggunakan ajax/fetch
  try {
    const response = await fetch("php/order.php", {
      method: "POST",
      body: data,
    });
    const token = await response.text();
    // console.log(token);
    window.snap.pay(token);
  } catch (err) {
    console.log(err.message);
  }
});

// format pesan whatsapp
const formatMessage = (obj) => {
  return `Data Customer
Nama: ${obj.name}
Email: ${obj.email}
No HP: ${obj.phone}

Data Pesanan
${JSON.parse(obj.items)
  .map((item) => `${item.name} (${item.quantity} x ${rupiah(item.total)}) \n`)
  .join("")}
TOTAL: ${rupiah(obj.total)}

Terima kasih.`;
};

// rupiah
const rupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};
