@echo off
echo Dang kich hoat moi truong conda...
call conda activate walletlab
if errorlevel 1 (
    echo Loi: Khong the kich hoat moi truong conda. Hay tao moi truoc.
    echo Lenh: conda env create -f environment.yml
    pause
    exit /b 1
)

echo Dang khoi dong server backend...
cd backend
python app.py
pause

