import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
declare var $: any

@Component({
    selector: 'app-create-order',
    templateUrl: './create-order.component.html',
    styleUrls: ['./create-order.component.css']
})
export class CreateOrderComponent implements OnInit, AfterViewInit {
    constructor(private http: HttpClient) { }

    employees = []
    products = []

    ngOnInit() {
        this.http
            .get<any>('https://dummy.restapiexample.com/api/v1/employees')
            .subscribe(res => {
                this.employees = res.data
            })

        this.http
            .get<any>('http://localhost:3000/products')
            .subscribe(res => {
                this.products = res
            })
    }

    ngAfterViewInit() {
        function validateShowProducts() {
            var name = $('#name').val()
            var distribution_center = $('#distribution-center').val()

            if (name != "" &&
                distribution_center != "" &&
                distribution_center != null) {
                $('#field-payment-type').attr("hidden", false)
                $('#field-expiration-date').attr("hidden", false)
                $('#field-notes').attr("hidden", false)
                $('#products').attr("hidden", false)
            }
        }

        function totalAllPrice() {
            var total_all_price = 0
            $('.total-price').each(function (this: any) {
                total_all_price = parseInt($(this).val()) + total_all_price
            })
            $('#total-all-price').text(toRP(total_all_price))
        }

        function toRP(number = 0) {
            if (typeof number != 'undefined') {
                var nominal: RegExpMatchArray | null = number.toString().split("").reverse().join("").match(/\d{1,3}/g)
                if (nominal) {
                    return (nominal.join(".").split("").reverse().join(""))
                }
            }
            return 0
        }

        function addProduct() {
            var detail_product = $('.detail-product').last()
            if (detail_product.find('.delete-product').length != 0) {
                detail_product.clone().appendTo('.list-products')
            }
            if (detail_product.find('.delete-product').length == 0) {
                detail_product.clone().prepend(`<i class="fa-solid fa-circle-minus delete-product" style="color: #ff0000;"></i>`).appendTo('.list-products')
            }
            totalAllPrice()
            $('.btn-confirm').attr('disabled', true)
        }

        function validateAllInput() {
            $('.btn-confirm').attr('disabled', true)
            var check_input = true
            var check_select = true

            $('input').each(function (this: any) {
                if ($(this).val() == "" ||
                    $(this).val() == null) {
                    check_input = false
                }
            })
            $('select').each(function (this: any) {
                if ($(this).val() == "" ||
                    $(this).val() == null) {
                    check_select = false
                }
            })

            if (check_input && check_select) {
                $('.btn-confirm').attr('disabled', false)
            }
        }

        $(document).ready(function () {
            var today = new Date().toISOString().split("T")[0]
            $('#expiration-date').attr('min', today)

            $(document).on('change', '.product-name', function (this: any) {
                var product_name = $(this).val()
                var unit = $(this).closest('.detail-product').find('.unit')
                unit.empty()
                $(this).closest('.detail-product').find('.quantity').val('')
                $(this).closest('.detail-product').find('.price').val('')

                if (product_name != "") {
                    $.get('http://localhost:3000/products',
                        function (respon: any) {
                            $.each(respon, function (key: any, value: any) {
                                if (value.product_name == product_name) {
                                    unit.append(
                                        `<option value="" disabled selected>Unit</option>`
                                    )
                                    $.each(value.units, function (key: any, value: any) {
                                        unit.append(
                                            `<option value="${value.name}">${value.name}</option>`
                                        )
                                    })
                                }
                            })
                        })
                }

                if (product_name == "") {
                    unit.append(
                        `<option value="">No data available</option>`
                    )
                }
            })

            $(document).on('change', '#name', function (this: any) {
                var name = $(this).val()
                var distribution_center = $('#distribution-center').val()

                if (name != "" &&
                    (distribution_center == "" ||
                        distribution_center == null)) {
                    $('#distribution-center').empty()
                    $('#distribution-center').append(
                        `<option value="" disabled selected>Distribution Center</option>
                        <option value="DC Tangerang">DC Tangerang</option>
                        <option value="DC Cikarang">DC Cikarang</option>`
                    )

                    validateShowProducts()
                }

                if (name == "") {
                    $('#distribution-center').append(
                        `<option value="">No data available</option>`
                    )
                }
            })

            $(document).on('change', '#distribution-center', function () {
                validateShowProducts()
            })

            $(document).on('change', '.unit', function (this: any) {
                var product_name = $(this).closest('.detail-product').find('.product-name').val()
                var unit = $(this).val()
                var price = $(this).closest('.detail-product').find('.price')
                var total_price = $(this).closest('.detail-product').find('.total-price')
                var total_net_price = $(this).closest('.detail-product').find('.total-nett-price')
                price.val('')
                total_price.val('')
                total_net_price.text(0)

                if (product_name != "" &&
                    unit != "") {
                    $.get('http://localhost:3000/products',
                        function (respon: any) {
                            $.each(respon, function (key: any, value: any) {
                                if (value.product_name == product_name) {
                                    $.each(value.units, function (key: any, value: any) {
                                        if (value.name == unit) {
                                            price.val(value.price)
                                        }
                                    })
                                }
                            })
                        }
                    )
                }
            })

            $(document).on('input', '.quantity', function (this: any) {
                var price = $(this).closest('.detail-product').find('.price').val()
                var quantity = $(this).val()
                var total_price = $(this).closest('.detail-product').find('.total-price')
                var total_nett_price = $(this).closest('.detail-product').find('.total-nett-price')
                total_price.val('')
                total_nett_price.text(0)
                $('#total-all-price').text(0)

                if (price > 0 &&
                    price != null &&
                    quantity > 0 &&
                    quantity != null) {
                    total_price.val(price * quantity)
                    total_nett_price.text(toRP(price * quantity))
                    totalAllPrice()
                }
            })

            $(document).on('input', '.price', function (this: any) {
                var price = $(this).val()
                var quantity = $(this).closest('.detail-product').find('.quantity').val()
                var total_price = $(this).closest('.detail-product').find('.total-price')
                var total_nett_price = $(this).closest('.detail-product').find('.total-nett-price')
                total_price.val('')
                total_nett_price.text(0)
                $('#total-all-price').text(0)

                if (price > 0 &&
                    price != null &&
                    quantity > 0 &&
                    quantity != null) {
                    total_price.val(price * quantity)
                    total_nett_price.text(toRP(price * quantity))
                    totalAllPrice()
                }
            })

            $(document).on('input', 'input', function () {
                validateAllInput()
            })

            $(document).on('change', 'select', function () {
                validateAllInput()
            })

            $(document).on('click', '.delete-product', function (this: any) {
                var detail_product = $(this).closest('.detail-product')
                var total_price = parseInt($(this).closest('.detail-product').find('.total-price').val())
                var total_all_price = 0
                $('.total-price').each(function (this: any) {
                    total_all_price = parseInt($(this).val()) + total_all_price
                })

                if (total_price != null &&
                    !isNaN(total_price)) {
                    $('#total-all-price').text(toRP(total_all_price - total_price))
                }
                detail_product.remove()
            })

            $(document).on('click', '.btn-add-product', function () {
                addProduct()
            })

            $(document).on('click', '.btn-cancel', function () {
                window.location.reload()
            })

            $(document).on('click', '.btn-confirm', function () {
                alert('Order successfully added')
                window.location.reload()
            })
        })
    }
}