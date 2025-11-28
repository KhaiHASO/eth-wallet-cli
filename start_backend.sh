#!/bin/bash

echo "Đang kích hoạt môi trường conda..."
source $(conda info --base)/etc/profile.d/conda.sh
conda activate walletlab

if [ $? -ne 0 ]; then
    echo "Lỗi: Không thể kích hoạt môi trường conda. Hãy tạo môi trường trước."
    echo "Chạy: conda env create -f environment.yml"
    exit 1
fi

echo "Đang khởi động backend..."
cd backend
python app.py

